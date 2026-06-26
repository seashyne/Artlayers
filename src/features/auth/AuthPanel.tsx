import { Cloud, Loader2, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { useCloudStore } from "../../store/cloudStore";

export const AuthPanel = () => {
  const authMode = useCloudStore((state) => state.authMode);
  const status = useCloudStore((state) => state.status);
  const error = useCloudStore((state) => state.error);
  const setAuthMode = useCloudStore((state) => state.setAuthMode);
  const signIn = useCloudStore((state) => state.signIn);
  const signUp = useCloudStore((state) => state.signUp);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isRegister = authMode === "register";
  const isLoading = status === "loading";

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = { email, password, name };
    void (isRegister ? signUp(payload) : signIn(payload));
  };

  return (
    <div className="grid h-full place-items-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm border border-white/10 bg-panel/95 p-4 shadow-soft backdrop-blur-xl"
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md border border-sky-300/20 bg-sky-300/10 text-sky-200">
            <Cloud size={19} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white">Artlayers Cloud</h1>
            <p className="text-xs text-slate-400">Sign in to manage synced artwork files.</p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 border border-white/10 bg-black/20 p-1">
          <button
            type="button"
            onClick={() => setAuthMode("login")}
            className={`h-9 text-sm ${!isRegister ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("register")}
            className={`h-9 text-sm ${isRegister ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
          >
            Register
          </button>
        </div>

        <div className="grid gap-3">
          {isRegister ? (
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Display name"
              className="h-10 border border-white/10 bg-black/25 px-3 text-sm text-white"
              required
            />
          ) : null}
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="Email"
            className="h-10 border border-white/10 bg-black/25 px-3 text-sm text-white"
            required
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="Password"
            minLength={6}
            className="h-10 border border-white/10 bg-black/25 px-3 text-sm text-white"
            required
          />
        </div>

        {error ? <p className="mt-3 border border-red-400/20 bg-red-400/10 p-2 text-xs text-red-200">{error}</p> : null}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-sky-300 px-3 text-sm font-medium text-slate-950 disabled:cursor-wait disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : isRegister ? <UserPlus size={16} /> : <LogIn size={16} />}
          {isRegister ? "Create account" : "Login"}
        </button>
      </form>
    </div>
  );
};
