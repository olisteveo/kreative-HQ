# Kreative-HQ SaaS v1.0 Technical Specification

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React App     │────▶│   Node.js API    │────▶│   PostgreSQL    │
│  (Dashboard)    │     │   (Express/Fastify)│    │   (Main DB)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │
         │              ┌────────┴────────┐
         │              │                 │
         ▼              ▼                 ▼
┌─────────────────┐  ┌──────────┐   ┌──────────┐
│  WebSocket      │  │  Redis   │   │  AI      │
│  (Real-time)    │  │  (Cache/ │   │  Proxy   │
│                 │  │  Queue)  │   │  Service │
└─────────────────┘  └──────────┘   └──────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    ▼                      ▼                      ▼
              ┌──────────┐          ┌──────────┐          ┌──────────┐
              │ OpenAI   │          │ Anthropic│          │ Moonshot │
              │ API      │          │ API      │          │ API      │
              └──────────┘          └──────────┘          └──────────┘
```

## Core Components

### 1. Backend API (Node.js/TypeScript)

**Responsibilities:**
- Authentication & session management
- AI provider proxy/routing
- Cost tracking & aggregation
- Real-time WebSocket events
- Webhook handling for provider billing

**Key Endpoints:**
```
POST   /api/v1/auth/login          # JWT-based auth
POST   /api/v1/auth/register       # Team signup
GET    /api/v1/team/profile        # Team settings
POST   /api/v1/chat                # Unified chat endpoint
GET    /api/v1/costs/realtime      # Live cost data
GET    /api/v1/costs/history       # Historical costs
POST   /api/v1/agents/assign       # Assign task to agent
GET    /api/v1/whiteboard          # Get whiteboard state
POST   /api/v1/whiteboard/update   # Update whiteboard
WS     /ws/v1/office               # Real-time office state
```

**AI Proxy Service:**
```typescript
interface AIRequest {
  provider: 'openai' | 'anthropic' | 'moonshot';
  model: string;
  messages: Message[];
  teamId: string;
  userId: string;
  metadata?: {
    agentId?: string;
    taskId?: string;
  };
}

// Routes to correct provider, tracks costs, streams response
async function proxyAIRequest(req: AIRequest): Promise<Stream> {
  const startTime = Date.now();
  const provider = getProvider(req.provider);
  
  // Pre-flight cost estimate
  const estimatedCost = estimateCost(req.model, req.messages);
  await checkBudget(req.teamId, estimatedCost);
  
  // Stream response while tracking actual usage
  const response = await provider.stream(req);
  const actualCost = await trackUsage(req, response);
  
  // Log for analytics
  await logAIInteraction({
    teamId: req.teamId,
    model: req.model,
    cost: actualCost,
    latency: Date.now() - startTime,
    timestamp: new Date()
  });
  
  return response;
}
```

### 2. Database Schema (PostgreSQL)

```sql
-- Teams/Organizations
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  plan text default 'free', -- free, pro, enterprise
  monthly_budget decimal(10,2) default 100.00,
  created_at timestamptz default now()
);

-- Users (team members)
create table users (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id),
  email text unique not null,
  role text default 'member', -- owner, admin, member
  preferences jsonb default '{}',
  created_at timestamptz default now()
);

-- AI Provider Credentials (encrypted)
create table provider_credentials (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id),
  provider text not null, -- openai, anthropic, moonshot
  api_key_encrypted text not null,
  is_active boolean default true,
  rate_limit_per_minute int default 60
);

-- AI Usage / Cost Tracking
create table ai_usage (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id),
  user_id uuid references users(id),
  provider text not null,
  model text not null,
  input_tokens int not null,
  output_tokens int not null,
  cost_usd decimal(10,6) not null,
  agent_id text, -- which "agent" was used
  task_id text,
  created_at timestamptz default now()
);

-- Whiteboard
create table whiteboard_notes (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id),
  tab text not null, -- vision, goals, rules, etc
  content text not null,
  color text default '#fef3c7',
  created_by uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tasks / Agent Assignments
create table tasks (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id),
  title text not null,
  description text,
  agent_id text not null, -- which AI model/agent
  status text default 'pending', -- pending, in-progress, completed, failed
  cost_usd decimal(10,6),
  result jsonb,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Real-time office state (ephemeral)
create table office_sessions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id),
  user_id uuid references users(id),
  socket_id text,
  agent_positions jsonb, -- current positions on canvas
  last_activity timestamptz default now()
);
```

### 3. Real-Time Architecture (WebSocket + Redis)

**Office State Sync:**
```typescript
// When user opens dashboard
io.on('connection', (socket) => {
  const { teamId, userId } = authenticate(socket);
  
  // Join team room
  socket.join(`team:${teamId}`);
  
  // Send current office state
  socket.emit('office:state', await getOfficeState(teamId));
  
  // Broadcast agent movements to team
  socket.on('agent:move', (data) => {
    socket.to(`team:${teamId}`).emit('agent:update', data);
  });
  
  // Task started/completed events
  socket.on('task:start', async (task) => {
    await createTask(task);
    io.to(`team:${teamId}`).emit('task:started', task);
  });
});
```

**Redis Pub/Sub for Multi-Server:**
```
Server A ──▶ Redis Pub ──▶ Server B
   │                          │
   ◀── WebSocket ◀───────────◀┘
```

### 4. Cost Tracking System

**Real-time Aggregation:**
```typescript
// Materialized view for fast dashboard queries
create materialized view team_costs_daily as
select 
  team_id,
  date_trunc('day', created_at) as date,
  provider,
  model,
  sum(cost_usd) as total_cost,
  sum(input_tokens) as total_input,
  sum(output_tokens) as total_output,
  count(*) as request_count
from ai_usage
group by team_id, date_trunc('day', created_at), provider, model;

-- Refresh every minute
create index idx_team_costs_daily_team_date 
on team_costs_daily(team_id, date);
```

**Budget Alerts:**
```typescript
async function checkBudget(teamId: string, estimatedCost: number) {
  const team = await db.teams.findById(teamId);
  const currentSpend = await getCurrentMonthSpend(teamId);
  
  const projectedTotal = currentSpend + estimatedCost;
  
  if (projectedTotal > team.monthly_budget * 0.9) {
    await sendAlert(teamId, 'budget_warning', {
      current: currentSpend,
      budget: team.monthly_budget,
      projected: projectedTotal
    });
  }
  
  if (projectedTotal > team.monthly_budget) {
    throw new BudgetExceededError();
  }
}
```

### 5. Frontend Changes for SaaS

**Auth Flow:**
```typescript
// Add to App.tsx
function App() {
  const { user, team, isLoading } = useAuth();
  
  if (isLoading) return <Loading />;
  if (!user) return <LoginPage />;
  if (!team?.providers?.length) return <OnboardingSetup />;
  
  return <Dashboard team={team} />;
}
```

**API Client with Auth:**
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

// Cost tracking hook
function useRealtimeCosts(teamId: string) {
  const [costs, setCosts] = useState({});
  
  useEffect(() => {
    const ws = new WebSocket(`wss://api.kreativehq.com/ws/v1/office?team=${teamId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'cost:update') {
        setCosts(data.costs);
      }
    };
    
    return () => ws.close();
  }, [teamId]);
  
  return costs;
}
```

### 6. Security Considerations

**API Key Encryption:**
```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const MASTER_KEY = process.env.ENCRYPTION_KEY; // 32 bytes

function encryptApiKey(apiKey: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, MASTER_KEY, iv);
  
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}
```

**Rate Limiting:**
```typescript
// Per-team rate limiting
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'ratelimit',
  points: 100, // requests
  duration: 60, // per minute
});

app.use('/api/v1/chat', async (req, res, next) => {
  try {
    await rateLimiter.consume(req.team.id);
    next();
  } catch {
    res.status(429).json({ error: 'Rate limit exceeded' });
  }
});
```

### 7. Deployment Architecture

**Docker Compose (Single Server):**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://redis:6379
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
  
  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

**Kubernetes (Scale):**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kreative-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: kreative-api
  template:
    spec:
      containers:
      - name: api
        image: kreativehq/api:v1.0
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
```

### 8. Pricing Tiers

| Feature | Free | Pro ($29/mo) | Enterprise |
|---------|------|--------------|------------|
| Team members | 2 | 10 | Unlimited |
| Monthly AI budget | $50 | $500 | Custom |
| Providers | 1 | Unlimited | Unlimited |
| Cost history | 7 days | 1 year | Unlimited |
| Whiteboard | Basic | Full | Full + Export |
| API access | No | Yes | Yes + Webhooks |
| Support | Community | Email | Slack + Phone |

## Implementation Phases

**Phase 1 (MVP - 4 weeks):**
- Backend API with auth
- Single provider (OpenAI) support
- Basic cost tracking
- Real-time office sync

**Phase 2 (v1.0 - 4 more weeks):**
- Multi-provider support
- Team management
- Whiteboard persistence
- Billing/subscriptions

**Phase 3 (Scale):**
- Advanced analytics
- Custom agents
- API access for teams
- Enterprise features

## Critical Decisions

1. **Self-hosted vs Managed:** Start with managed (Render/Railway), migrate to K8s at scale
2. **WebSocket vs SSE:** WebSocket for bidirectional, SSE fallback
3. **Cost tracking:** Real-time via webhooks + daily reconciliation job
4. **Data retention:** 90 days hot, 2 years cold (S3)

**Estimated infra cost at 100 teams:** ~$500/month (before profit)
