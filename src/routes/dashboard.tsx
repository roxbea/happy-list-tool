// Agenda de cumples
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Plus, Eye, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Panel · Cumples" }] }),
  component: Dashboard,
});

type Cumple = { id: string; nombre: string; dia: number; mes: number };

const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const DIAS_POR_MES = [31,29,31,30,31,30,31,31,30,31,30,31];

type View = "home" | "ver" | "agregar";

function Dashboard() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [view, setView] = useState<View>("home");
  const [cumples, setCumples] = useState<Cumple[]>([]);
  const [loading, setLoading] = useState(false);

  // form
  const [nombre, setNombre] = useState("");
  const [mes, setMes] = useState<string>("1");
  const [dia, setDia] = useState<string>("1");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate({ to: "/auth", replace: true });
      } else {
        setUserId(data.session.user.id);
        setEmail(data.session.user.email ?? "");
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/auth", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const fetchCumples = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cumples")
      .select("id, nombre, dia, mes")
      .order("mes", { ascending: true })
      .order("dia", { ascending: true });
    if (error) toast.error(error.message);
    else setCumples((data as Cumple[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (userId && (view === "ver" || view === "agregar")) fetchCumples();
  }, [userId, view]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const nombreTrim = nombre.trim();
    if (!nombreTrim) return toast.error("Ingresá un nombre");
    setSaving(true);
    const { error } = await supabase.from("cumples").insert({
      user_id: userId,
      nombre: nombreTrim.slice(0, 40),
      dia: Number(dia),
      mes: Number(mes),
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Cumpleaños agregado");
    setNombre(""); setDia("1"); setMes("1");
    fetchCumples();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("cumples").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setCumples((c) => c.filter((x) => x.id !== id));
    toast.success("Eliminado");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const formatFecha = (c: Cumple) => `${String(c.dia).padStart(2, "0")} ${MESES[c.mes - 1]}`;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {view !== "home" && (
              <button onClick={() => setView("home")} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <h1 className="text-lg font-light tracking-tight">cumples</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">{email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>Salir</Button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {view === "home" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => setView("ver")}
              className="group border rounded-lg p-8 text-left hover:border-foreground/30 transition"
            >
              <Eye className="h-5 w-5 mb-4 text-muted-foreground group-hover:text-foreground transition" />
              <h2 className="text-base font-medium">Ver</h2>
              <p className="text-sm text-muted-foreground mt-1">Listado de cumpleaños</p>
            </button>
            <button
              onClick={() => setView("agregar")}
              className="group border rounded-lg p-8 text-left hover:border-foreground/30 transition"
            >
              <Plus className="h-5 w-5 mb-4 text-muted-foreground group-hover:text-foreground transition" />
              <h2 className="text-base font-medium">Agregar</h2>
              <p className="text-sm text-muted-foreground mt-1">Sumar o borrar cumpleaños</p>
            </button>
          </div>
        )}

        {view === "ver" && (
          <section>
            <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-6">Cumpleaños</h2>
            {loading ? (
              <p className="text-sm text-muted-foreground">Cargando...</p>
            ) : cumples.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no agregaste ninguno.</p>
            ) : (
              <ul className="divide-y border-y">
                {cumples.map((c) => (
                  <li key={c.id} className="py-4 flex items-center gap-4">
                    <span className="text-xs tabular-nums text-muted-foreground w-28 shrink-0">
                      {formatFecha(c)}
                    </span>
                    <div className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-thin">
                      <span className="text-sm">{c.nombre}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {view === "agregar" && (
          <section className="space-y-10">
            <form onSubmit={handleAdd} className="space-y-5 border rounded-lg p-6">
              <h2 className="text-sm uppercase tracking-widest text-muted-foreground">Nuevo cumpleaños</h2>
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  maxLength={40}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Máx. 40 caracteres"
                />
                <p className="text-xs text-muted-foreground text-right">{nombre.length}/40</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Mes</Label>
                  <Select value={mes} onValueChange={(v) => { setMes(v); if (Number(dia) > DIAS_POR_MES[Number(v)-1]) setDia("1"); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MESES.map((m, i) => <SelectItem key={i} value={String(i+1)}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Día</Label>
                  <Select value={dia} onValueChange={setDia}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: DIAS_POR_MES[Number(mes)-1] }, (_, i) => i+1).map((d) =>
                        <SelectItem key={d} value={String(d)}>{String(d).padStart(2,"0")}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Guardando..." : "Agregar"}
              </Button>
            </form>

            <div>
              <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">Existentes</h2>
              {loading ? (
                <p className="text-sm text-muted-foreground">Cargando...</p>
              ) : cumples.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin cumpleaños todavía.</p>
              ) : (
                <ul className="divide-y border-y">
                  {cumples.map((c) => (
                    <li key={c.id} className="py-3 flex items-center gap-4">
                      <span className="text-xs tabular-nums text-muted-foreground w-28 shrink-0">
                        {formatFecha(c)}
                      </span>
                      <div className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-thin">
                        <span className="text-sm">{c.nombre}</span>
                      </div>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-muted-foreground hover:text-destructive transition shrink-0"
                        aria-label="Borrar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
