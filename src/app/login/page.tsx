import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hint-of-sky px-4">
      <div className="w-full max-w-[380px]">
        <div className="mb-6 text-center">
          <h1 className="font-display text-[34px] leading-[1.18] tracking-[-1.19px] font-extrabold text-deep-space-charcoal">
            서천군 정책관리 ERP
          </h1>
          <p className="mt-2 text-[14px] tracking-[-0.15px] text-muted-foreground">
            정책·주요업무·순기표 통합 관리 시스템
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
