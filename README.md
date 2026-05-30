# 서천군 정책관리 ERP (picklelinic)

서천군청 기획실·각 부서 기획팀을 위한 정책·주요업무·순기표 통합 관리 시스템.

- 기획 문서: [`docs/ERP_목표문서.md`](docs/ERP_목표문서.md)
- 기능 체크리스트: [`docs/ERP_기능_체크리스트.json`](docs/ERP_기능_체크리스트.json)
- 디자인 기준(단일 SoT): [`DESIGN.md`](DESIGN.md) — ClickUp 스타일, shadcn/ui 기반

## 기술 스택

| 영역 | 선택 | 비고 |
|------|------|------|
| 프레임워크 | Next.js 16 (App Router) + React 19 + TypeScript | |
| 스타일 | Tailwind CSS v4 + shadcn/ui | 디자인 토큰은 `src/app/globals.css` `@theme` |
| DB | **PostgreSQL 16** | 대용량 읽기/쓰기, 관계형 집계·전문검색에 적합 |
| ORM | **Drizzle ORM** (postgres-js) | 경량·고성능, 커넥션 풀(`max: 20`) |
| 인증 | Auth.js (NextAuth v5) Credentials + JWT 세션 | RBAC 3단계 |

### 데이터베이스 선택 근거
대용량 읽기/쓰기가 빈번한 요구에 맞춰 **PostgreSQL**을 채택했다. 강력한 동시성(MVCC),
사업비·재원·읍면별 집계에 적합한 관계형 모델, 전문검색·JSONB·파티셔닝 등 확장성을 제공하며
군청 내부망 자체 운영에 적합하다. ORM은 런타임 오버헤드가 작고 타입 안전한 **Drizzle**을 사용한다.

### 권한(RBAC)
`admin`(관리자) · `manager`(중간관리자) · `user`(일반) — `src/lib/rbac.ts`, 라우트 보호는 `src/middleware.ts`.

## 개발 환경 실행

```bash
# 1) 의존성
pnpm install

# 2) 환경변수 (.env)
cp .env.example .env   # DATABASE_URL, AUTH_SECRET 설정

# 3) DB 스키마 적용 & 시드
pnpm db:migrate
pnpm db:seed           # 읍면·공통코드·조직·관리자 계정 생성

# 4) 개발 서버
pnpm dev               # http://localhost:3000
```

기본 관리자: `admin` / `admin1234` — **운영 전 반드시 변경**.

## 주요 스크립트
- `pnpm db:generate` 스키마 → 마이그레이션 생성
- `pnpm db:migrate` 마이그레이션 적용 · `pnpm db:push` 직접 반영
- `pnpm db:seed` 기준정보 시드 · `pnpm db:studio` Drizzle Studio
- `pnpm build` / `pnpm start` 프로덕션 빌드·실행

## 개발 진행 상황 (체크리스트 기준)

- ✅ **1단계 기반**: 인증/로그인, RBAC 3단계, 미들웨어 보호, 부서/팀·읍면·공통코드 기준정보,
  관리자 — 기준정보 조회·사용자 목록, 대시보드(기준정보 카운트)
- ⬜ 2단계 정책 아카이브·협업 / 3단계 주요업무 보고회 / 4단계 순기표 /
  5단계 공약·공모·기금·성과 / 6단계 대시보드·출력·알림

각 모듈은 `docs/ERP_기능_체크리스트.json`의 항목 순서대로 개발한다.

## 구조

```
src/
  app/
    login/                 # 로그인 (공개)
    (app)/                 # 인증 필요 — 사이드바 레이아웃
      page.tsx             # 대시보드
      admin/base-data/     # 기준정보 (manager+)
      admin/users/         # 사용자 관리 (admin)
      policies, ideas, ... # 후속 단계 모듈(현재 placeholder)
    api/auth/[...nextauth] # Auth.js 핸들러
  components/ui/           # shadcn 컴포넌트 (DESIGN.md 준수)
  db/                      # Drizzle: schema, client, migrations, seed
  lib/                     # rbac, nav, utils
  auth.ts, auth.config.ts, middleware.ts
```
