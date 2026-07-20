import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  Camera,
  ChevronDown,
  Info,
  LogOut,
  Lock,
  Mail,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Pencil,
  X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/lib/supabaseExternal";
import { CHU_COORDS, googleMapsUrl } from "@/lib/chuCoords";


export const Route = createFileRoute("/")({
  component: CarnetApp,
});

/* ---------------- Data ---------------- */

const HOSPITALS = [
  "CHU Mustapha Pacha",
  "CHU Bab El Oued",
  "CHU Beni Messous",
  "CHU Douera",
  "CHU Blida",
  "CHU Oran",
  "CHU Constantine",
  "CHU Annaba",
  "CHU Sétif",
  "CHU Batna",
  "CHU Tizi Ouzou",
  "CHU Tlemcen",
  "CHU Sidi Bel Abbès",
  "CHU Béjaïa",
  "CHU Mostaganem",
  "CHU Biskra",
  "CHU Ouargla",
  "CHU Béchar",
];

type Specialty = {
  id: string;
  fr: string;
  ar: string;
  emoji: string;
  hue: number; // for card gradient
  suggestions: string[];
};

const SPECIALTIES: Specialty[] = [
  { id: "urgences", fr: "Urgences", ar: "الاستعجالات", emoji: "🚨", hue: 5, suggestions: ["Appendicite aiguë", "Colique néphrétique", "Œdème aigu du poumon"] },
  { id: "cardio", fr: "Cardiologie", ar: "أمراض القلب", emoji: "❤️", hue: 355, suggestions: ["HTA", "Infarctus du myocarde", "Insuffisance cardiaque"] },
  { id: "pneumo", fr: "Pneumologie", ar: "أمراض الصدر", emoji: "🫁", hue: 200, suggestions: ["Pneumopathie", "Asthme", "Tuberculose pulmonaire"] },
  { id: "pediatrie", fr: "Pédiatrie", ar: "طب الأطفال", emoji: "🧒", hue: 30, suggestions: ["Bronchiolite", "Gastro-entérite aiguë", "Diarrhée aiguë"] },
  { id: "gyneco", fr: "Gynécologie-Obstétrique", ar: "أمراض النساء والتوليد", emoji: "🤰", hue: 330, suggestions: ["Grossesse normale", "Pré-éclampsie", "Fibrome utérin"] },
  { id: "chir", fr: "Chirurgie Générale", ar: "الجراحة العامة", emoji: "🔪", hue: 220, suggestions: ["Cholécystite", "Hernie inguinale", "Occlusion intestinale"] },
  { id: "neuro", fr: "Neurologie", ar: "أمراض الأعصاب", emoji: "🧠", hue: 280, suggestions: ["AVC ischémique", "Épilepsie", "Migraine"] },
  { id: "nephro", fr: "Néphrologie", ar: "أمراض الكلى", emoji: "🩺", hue: 190, suggestions: ["IRC", "Syndrome néphrotique", "Pyélonéphrite"] },
  { id: "gastro", fr: "Gastro-entérologie", ar: "أمراض الجهاز الهضمي", emoji: "🍽️", hue: 40, suggestions: ["Ulcère gastrique", "Hépatite virale", "RGO"] },
  { id: "endocrino", fr: "Endocrinologie", ar: "أمراض الغدد", emoji: "🧬", hue: 160, suggestions: ["Diabète type 2", "Hypothyroïdie", "Acidocétose diabétique"] },
  { id: "rhumato", fr: "Rhumatologie", ar: "أمراض الروماتيزم", emoji: "🦴", hue: 25, suggestions: ["Polyarthrite rhumatoïde", "Arthrose", "Goutte"] },
  { id: "dermato", fr: "Dermatologie", ar: "أمراض الجلد", emoji: "🧴", hue: 340, suggestions: ["Eczéma", "Psoriasis", "Acné"] },
  { id: "ophtalmo", fr: "Ophtalmologie", ar: "طب العيون", emoji: "👁️", hue: 210, suggestions: ["Cataracte", "Glaucome", "Conjonctivite"] },
  { id: "orl", fr: "ORL", ar: "الأنف والأذن والحنجرة", emoji: "👂", hue: 260, suggestions: ["Otite moyenne", "Sinusite", "Angine"] },
  { id: "psy", fr: "Psychiatrie", ar: "الطب النفسي", emoji: "🧘", hue: 300, suggestions: ["Dépression", "Trouble anxieux", "Schizophrénie"] },
  { id: "hemato", fr: "Hématologie", ar: "أمراض الدم", emoji: "🩸", hue: 0, suggestions: ["Anémie ferriprive", "Leucémie aiguë", "Lymphome"] },
  { id: "onco", fr: "Oncologie", ar: "علم الأورام", emoji: "🎗️", hue: 320, suggestions: ["Cancer du sein", "Cancer colorectal", "Cancer du poumon"] },
  { id: "infectio", fr: "Infectiologie", ar: "الأمراض المعدية", emoji: "🦠", hue: 130, suggestions: ["Paludisme", "COVID-19", "Fièvre typhoïde"] },
  { id: "radio", fr: "Radiologie", ar: "الأشعة", emoji: "🩻", hue: 240, suggestions: ["Fracture", "Pneumopathie radiologique", "Lithiase rénale"] },
  { id: "anesthesie", fr: "Anesthésie-Réanimation", ar: "التخدير والإنعاش", emoji: "💉", hue: 195, suggestions: ["Choc septique", "Détresse respiratoire aiguë", "Sepsis"] },
  { id: "ortho", fr: "Orthopédie", ar: "جراحة العظام", emoji: "🦵", hue: 15, suggestions: ["Fracture du col fémoral", "Entorse de la cheville", "Lombalgie"] },
  { id: "uro", fr: "Urologie", ar: "أمراض المسالك البولية", emoji: "🚻", hue: 175, suggestions: ["Hypertrophie prostatique", "Lithiase urinaire", "Infection urinaire"] },
];

type CaseEntry = {
  id: string;
  specialty: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  photo?: string; // display URL (signed or object URL)
  photoPath?: string; // storage path saved in DB
  photoFile?: File; // pending upload
  hospital: string;
  date: string;
};


/* ---------------- Storage ---------------- */

const LS = {
  reminders: "cds:reminders",
};

/* ---------------- Component ---------------- */

type Tab = "home" | "stats" | "ai" | "notif" | "help";

function CarnetApp() {
  const [hydrated, setHydrated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [hospital, setHospital] = useState<string>(HOSPITALS[0]);
  const [cases, setCases] = useState<CaseEntry[]>([]);
  const [loadingCases, setLoadingCases] = useState(false);
  const [tab, setTab] = useState<Tab>("home");
  const [openSpecialty, setOpenSpecialty] = useState<Specialty | null>(null);
  const [reminders, setReminders] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setReminders(localStorage.getItem(LS.reminders) === "1");

    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
      setEmail(data.session?.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Load profile + cases when user changes
  useEffect(() => {
    if (!userId) {
      setCases([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingCases(true);
      const [{ data: profile, error: profileError }, { data: rows, error }] = await Promise.all([
        supabase.from("profiles").select("selected_chu").eq("id", userId).maybeSingle(),
        supabase
          .from("cases")
          .select("id, specialty, diagnosis, treatment, notes, image_url, hospital, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
      ]);
      if (cancelled) return;
      if (profile?.selected_chu) {
        setHospital(profile.selected_chu);
      } else if (!profileError) {
        await supabase.from("profiles").upsert(
          { id: userId, email, selected_chu: HOSPITALS[0] },
          { onConflict: "id" },
        );
        setHospital(HOSPITALS[0]);
      }
      if (error) {
        toast.error("Erreur lors du chargement des cas");
      } else if (rows) {
        const paths = rows.map((r) => r.image_url).filter((p): p is string => !!p);
        const signedMap = new Map<string, string>();
        if (paths.length) {
          const { data: signed } = await supabase.storage
            .from("case-images")
            .createSignedUrls(paths, 60 * 60);
          signed?.forEach((s) => {
            if (s.path && s.signedUrl) signedMap.set(s.path, s.signedUrl);
          });
        }
        setCases(
          rows.map((r) => ({
            id: r.id,
            specialty: r.specialty,
            diagnosis: r.diagnosis,
            treatment: r.treatment ?? "",
            notes: r.notes ?? "",
            photoPath: r.image_url ?? undefined,
            photo: r.image_url ? signedMap.get(r.image_url) : undefined,
            hospital: r.hospital ?? "",
            date: r.created_at ?? new Date().toISOString(),
          })),
        );
      }

      setLoadingCases(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, email]);

  // Persist hospital selection to profile
  const changeHospital = async (h: string) => {
    setHospital(h);
    if (userId) {
      const { error } = await supabase.from("profiles").upsert(
        { id: userId, email, selected_chu: h },
        { onConflict: "id" },
      );
      if (error) toast.error("Impossible d'enregistrer le CHU choisi");
    }
  };

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of cases) m[c.specialty] = (m[c.specialty] || 0) + 1;
    return m;
  }, [cases]);

  const total = cases.length;

  if (!hydrated) return null;

  if (!userId || !email) {
    return <LoginScreen />;
  }

  const addCase = async (c: CaseEntry): Promise<boolean> => {
    if (!userId) {
      toast.error("Connectez-vous pour enregistrer un cas");
      return false;
    }
    let photoPath: string | null = null;
    let photoUrl: string | undefined = undefined;
    if (c.photoFile) {
      const ext = (c.photoFile.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("case-images")
        .upload(path, c.photoFile, { contentType: c.photoFile.type });
      if (upErr) {
        toast.error("Échec du téléchargement de l'image");
        return false;
      }
      photoPath = path;
      const { data: signed } = await supabase.storage
        .from("case-images")
        .createSignedUrl(path, 60 * 60);
      photoUrl = signed?.signedUrl;
    }
    const coords = CHU_COORDS[c.hospital];
    const basePayload = {
      user_id: userId,
      specialty: c.specialty,
      diagnosis: c.diagnosis,
      treatment: c.treatment,
      notes: c.notes,
      image_url: photoPath,
      hospital: c.hospital,
    };
    let insertResp = await supabase
      .from("cases")
      .insert({ ...basePayload, chu_lat: coords?.lat ?? null, chu_lng: coords?.lng ?? null } as never)
      .select("id, created_at")
      .single();
    if (insertResp.error && /chu_lat|chu_lng|column/i.test(insertResp.error.message)) {
      insertResp = await supabase.from("cases").insert(basePayload).select("id, created_at").single();
    }
    const { data, error } = insertResp;
    if (error || !data) {
      if (photoPath) await supabase.storage.from("case-images").remove([photoPath]);
      toast.error("Impossible d'enregistrer le cas");
      return false;
    }
    setCases((prev) => [
      {
        ...c,
        id: data.id,
        date: data.created_at ?? c.date,
        photoFile: undefined,
        photoPath: photoPath ?? undefined,
        photo: photoUrl,
      },
      ...prev,
    ]);
    toast.success(`✅ Cas enregistré — ${c.diagnosis}`, {
      description: `${SPECIALTIES.find((s) => s.id === c.specialty)?.fr} · ${hospital}`,
    });
    return true;
  };

  const updateCase = async (id: string, c: CaseEntry): Promise<boolean> => {
    if (!userId) return false;
    const existing = cases.find((x) => x.id === id);
    let photoPath: string | null = existing?.photoPath ?? null;
    let photoUrl: string | undefined = existing?.photo;
    // New photo uploaded → replace
    if (c.photoFile) {
      const ext = (c.photoFile.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("case-images")
        .upload(path, c.photoFile, { contentType: c.photoFile.type });
      if (upErr) {
        toast.error("Échec du téléchargement de l'image");
        return false;
      }
      // Remove old
      if (existing?.photoPath) {
        await supabase.storage.from("case-images").remove([existing.photoPath]);
      }
      photoPath = path;
      const { data: signed } = await supabase.storage
        .from("case-images")
        .createSignedUrl(path, 60 * 60);
      photoUrl = signed?.signedUrl;
    }
    const coords = CHU_COORDS[c.hospital];
    const baseUpdate = {
      diagnosis: c.diagnosis,
      treatment: c.treatment,
      notes: c.notes,
      image_url: photoPath,
      hospital: c.hospital,
    };
    let upd = await supabase
      .from("cases")
      .update({ ...baseUpdate, chu_lat: coords?.lat ?? null, chu_lng: coords?.lng ?? null } as never)
      .eq("id", id)
      .eq("user_id", userId);
    if (upd.error && /chu_lat|chu_lng|column/i.test(upd.error.message)) {
      upd = await supabase.from("cases").update(baseUpdate).eq("id", id).eq("user_id", userId);
    }
    if (upd.error) {
      toast.error("Impossible de mettre à jour le cas");
      return false;
    }
    setCases((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              diagnosis: c.diagnosis,
              treatment: c.treatment,
              notes: c.notes,
              hospital: c.hospital,
              photoPath: photoPath ?? undefined,
              photo: photoUrl,
            }
          : x,
      ),
    );
    toast.success(`✏️ Cas mis à jour — ${c.diagnosis}`);
    return true;
  };


  const deleteCase = async (id: string) => {
    const prev = cases;
    const target = cases.find((c) => c.id === id);
    setCases((p) => p.filter((c) => c.id !== id));
    const { error } = await supabase.from("cases").delete().eq("id", id);
    if (error) {
      setCases(prev);
      toast.error("Suppression impossible");
      return;
    }
    if (target?.photoPath) {
      await supabase.storage.from("case-images").remove([target.photoPath]);
    }
    toast("🗑️ Cas supprimé");
  };


  const filtered = search
    ? SPECIALTIES.filter(
        (s) =>
          s.fr.toLowerCase().includes(search.toLowerCase()) ||
          s.ar.includes(search),
      )
    : SPECIALTIES;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Toaster position="top-center" richColors />

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-border bg-card/80 backdrop-blur-md transition-transform lg:static lg:translate-x-0 ${
            mobileNav ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarContent
            tab={tab}
            setTab={(t) => {
              setTab(t);
              setMobileNav(false);
            }}
            cases={cases}
            counts={counts}
            email={email}
            onLogout={async () => {
              await supabase.auth.signOut();
              setUserId(null);
              setEmail(null);
              setCases([]);
              setTab("home");
              setMobileNav(false);
              setOpenSpecialty(null);
              toast.success("Déconnexion réussie — à bientôt 👋");
            }}
          />
        </aside>
        {mobileNav && (
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setMobileNav(false)}
          />
        )}

        {/* Main */}
        <main className="flex-1 min-w-0">
          <Header
            hospital={hospital}
            setHospital={changeHospital}
            onOpenNav={() => setMobileNav(true)}
            total={total}
          />

          <div className="max-w-6xl mx-auto px-5 md:px-8 py-8">
            {tab === "home" && (
              <HomeTab
                search={search}
                setSearch={setSearch}
                specialties={filtered}
                counts={counts}
                onOpen={(s) => setOpenSpecialty(s)}
              />
            )}
            {tab === "stats" && (
              <StatsTab
                counts={counts}
                total={total}
                cases={cases}
                onDelete={deleteCase}
                loading={loadingCases}
              />
            )}
            {tab === "ai" && <AITab />}
            {tab === "notif" && (
              <NotifTab reminders={reminders} setReminders={setReminders} />
            )}
            {tab === "help" && <HelpTab />}
          </div>
        </main>
      </div>

      {openSpecialty && (
        <CaseModal
          specialty={openSpecialty}
          hospital={hospital}
          existingCases={cases.filter((c) => c.specialty === openSpecialty.id)}
          onDelete={deleteCase}
          onClose={() => setOpenSpecialty(null)}
          onSave={addCase}
          onUpdate={updateCase}
        />
      )}
    </div>
  );
}


/* ---------------- Login ---------------- */

function LoginScreen() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [emailValue, setEmailValue] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValue.includes("@")) {
      toast.error("Veuillez entrer un email valide");
      return;
    }
    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: emailValue.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast.success("Compte créé ✨ Vous êtes connecté");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailValue.trim(),
          password,
        });
        if (error) throw error;
        toast.success("Bienvenue dans votre Carnet de Stage ✨");
      }
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.toLowerCase().includes("invalid login")) {
        toast.error("Email ou mot de passe incorrect. Créez un compte si nouveau.");
      } else if (msg.toLowerCase().includes("already")) {
        toast.error("Cet email a déjà un compte. Connectez-vous.");
      } else {
        toast.error(msg || "Une erreur est survenue");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-5 overflow-hidden bg-background">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(1200px 500px at 20% 10%, oklch(0.9 0.08 190 / 0.5), transparent), radial-gradient(900px 500px at 80% 90%, oklch(0.9 0.08 40 / 0.4), transparent)",
        }}
      />
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card/90 backdrop-blur p-8 md:p-10 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-6">
          <Logo size={64} />
          <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mt-4">
            Journal Clinique
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight mt-1">
            CARNET DE STAGE
          </h1>
          <p className="font-ruqaa text-3xl text-primary mt-4 leading-relaxed">
            العلمُ صيدٌ وكتابتُه قيدٌ
          </p>
        </div>

        <div className="flex gap-2 p-1 rounded-xl bg-muted mb-5">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              mode === "signin" ? "bg-background shadow" : "text-muted-foreground"
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              mode === "signup" ? "bg-background shadow" : "text-muted-foreground"
            }`}
          >
            Créer un compte
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-foreground/80">
              Adresse e-mail
            </span>
            <div className="mt-2 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                required
                autoFocus
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                placeholder="etudiant@medecine.dz"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-foreground/80">
              Mot de passe
            </span>
            <div className="mt-2 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 active:scale-[0.99] transition shadow-lg shadow-primary/20 disabled:opacity-60"
          >
            {loading
              ? "Chargement..."
              : mode === "signup"
                ? "Créer mon compte →"
                : "Entrer dans mon carnet →"}
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          {mode === "signin"
            ? "Pas encore de compte ? Cliquez sur « Créer un compte »."
            : "Déjà inscrit ? Cliquez sur « Connexion »."}
        </p>
      </div>
    </div>
  );
}

/* ---------------- Sidebar ---------------- */

const NAV: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; emoji: string }[] = [
  { id: "home", label: "Spécialités", icon: Activity, emoji: "🏥" },
  { id: "stats", label: "Statistiques", icon: BarChart3, emoji: "📊" },
  { id: "ai", label: "Assistant IA", icon: Bot, emoji: "🤖" },
  { id: "notif", label: "Notifications", icon: Bell, emoji: "🔔" },
  { id: "help", label: "Aide & Concepteur", icon: Info, emoji: "ℹ️" },
];

function SidebarContent({
  tab,
  setTab,
  cases,
  counts,
  email,
  onLogout,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  cases: CaseEntry[];
  counts: Record<string, number>;
  email: string;
  onLogout: () => void;
}) {
  const topSpecs = useMemo(
    () =>
      [...SPECIALTIES]
        .map((s) => ({ ...s, n: counts[s.id] || 0 }))
        .sort((a, b) => b.n - a.n)
        .slice(0, 4),
    [counts],
  );

  return (
    <div className="h-full flex flex-col p-5">
      <div className="flex items-center gap-3 mb-8">
        <Logo size={44} />
        <div>
          <div className="font-display text-lg font-bold leading-none">
            Carnet de Stage
          </div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">
            Journal Clinique
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        {NAV.map((n) => {
          const active = tab === n.id;
          return (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                active
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-foreground/80 hover:bg-secondary"
              }`}
            >
              <span className="text-base">{n.emoji}</span>
              <span>{n.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-8">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3 px-1">
          Top spécialités
        </div>
        <div className="space-y-3">
          {topSpecs.map((s) => {
            const pct = cases.length ? Math.round((s.n / cases.length) * 100) : 0;
            return (
              <div key={s.id} className="px-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-foreground/80 truncate">
                    <span>{s.emoji}</span>
                    <span className="truncate">{s.fr}</span>
                  </span>
                  <span className="text-muted-foreground shrink-0">{s.n}</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: `oklch(0.6 0.15 ${s.hue})`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-border">
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="w-8 h-8 rounded-full bg-secondary grid place-items-center text-sm font-semibold text-foreground/80 shrink-0">
            {email.charAt(0).toUpperCase()}
          </div>
          <div className="text-xs text-muted-foreground truncate">{email}</div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground font-medium text-sm transition shadow-sm"
        >
          <LogOut className="w-4 h-4" /> Se déconnecter
        </button>
      </div>
    </div>
  );
}

/* ---------------- Header ---------------- */

function Header({
  hospital,
  setHospital,
  onOpenNav,
  total,
}: {
  hospital: string;
  setHospital: (h: string) => void;
  onOpenNav: () => void;
  total: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-4 flex items-start gap-4">
        <button
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-secondary mt-2"
          onClick={onOpenNav}
          aria-label="Menu"
        >
          <div className="w-5 h-0.5 bg-foreground mb-1" />
          <div className="w-5 h-0.5 bg-foreground mb-1" />
          <div className="w-5 h-0.5 bg-foreground" />
        </button>

        <div className="flex-1 min-w-0 flex items-center gap-3">
          <Logo size={44} />
          <div className="flex flex-col items-start text-left">
            <h1 className="font-display text-xl md:text-2xl font-bold tracking-tight leading-none">
              CARNET DE STAGE
            </h1>
            <p className="font-ruqaa text-primary text-base md:text-lg leading-none mt-1">
              العلمُ صيدٌ وكتابتُه قيدٌ
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-card border border-border hover:bg-secondary transition text-sm"
            >
              <span>🏥</span>
              <span className="hidden sm:inline max-w-[180px] truncate">{hospital}</span>
              <span className="sm:hidden">CHU</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            {open && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
                <div className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto rounded-xl border border-border bg-popover shadow-2xl z-40 p-1">
                  {HOSPITALS.map((h) => (
                    <button
                      key={h}
                      onClick={() => {
                        setHospital(h);
                        setOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-secondary transition ${
                        hospital === h ? "bg-secondary font-medium" : ""
                      }`}
                    >
                      🏥 {h}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/60 text-sm">
            <span className="text-base">📚</span>
            <span className="font-semibold">{total}</span>
            <span className="text-muted-foreground">cas</span>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Home Tab ---------------- */

function HomeTab({
  search,
  setSearch,
  specialties,
  counts,
  onOpen,
}: {
  search: string;
  setSearch: (v: string) => void;
  specialties: Specialty[];
  counts: Record<string, number>;
  onOpen: (s: Specialty) => void;
}) {
  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
            🏥 Vos rotations hospitalières
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight">
            Choisissez une spécialité <br className="hidden md:block" />
            pour enregistrer un cas.
          </h2>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une spécialité…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {specialties.map((s) => {
          const n = counts[s.id] || 0;
          return (
            <button
              key={s.id}
              onClick={() => onOpen(s)}
              className="group relative overflow-hidden text-left rounded-2xl border border-border bg-card p-4 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <div
                className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-25 group-hover:opacity-40 transition-opacity blur-2xl"
                style={{ background: `oklch(0.75 0.15 ${s.hue})` }}
              />
              <div
                className="w-11 h-11 rounded-xl grid place-items-center text-2xl mb-3 shadow-inner"
                style={{
                  background: `oklch(0.94 0.06 ${s.hue})`,
                }}
              >
                {s.emoji}
              </div>
              <div className="font-semibold text-sm leading-tight">{s.fr}</div>
              <div className="font-arabic text-xs text-muted-foreground mt-0.5">
                {s.ar}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  {n} cas
                </span>
                <span
                  className="w-7 h-7 rounded-full grid place-items-center bg-primary text-primary-foreground text-sm opacity-0 group-hover:opacity-100 transition"
                  aria-hidden
                >
                  <Plus className="w-4 h-4" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Stats Tab ---------------- */

function StatsTab({
  counts,
  total,
  cases,
  onDelete,
  loading,
}: {
  counts: Record<string, number>;
  total: number;
  cases: CaseEntry[];
  onDelete: (id: string) => void;
  loading?: boolean;
}) {

  const ranked = useMemo(
    () =>
      [...SPECIALTIES]
        .map((s) => ({ ...s, n: counts[s.id] || 0 }))
        .sort((a, b) => b.n - a.n),
    [counts],
  );
  const maxN = Math.max(1, ...ranked.map((r) => r.n));

  const chuRanked = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of cases) {
      if (!c.hospital) continue;
      m[c.hospital] = (m[c.hospital] || 0) + 1;
    }
    return Object.entries(m)
      .map(([hospital, n]) => ({ hospital, n }))
      .sort((a, b) => b.n - a.n);
  }, [cases]);
  const maxChu = Math.max(1, ...chuRanked.map((r) => r.n));

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
          📊 Vue d'ensemble
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold">
          {total} cas enregistrés dans votre carnet.
        </h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="text-sm font-semibold mb-5 flex items-center gap-2">
            🩺 Répartition par spécialité
          </div>
          <div className="space-y-3">
            {ranked.map((s) => {
              const pct = total ? Math.round((s.n / total) * 100) : 0;
              const bar = total ? (s.n / maxN) * 100 : 0;
              return (
                <div key={s.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <span>{s.emoji}</span>
                      <span className="font-medium">{s.fr}</span>
                      <span className="font-arabic text-xs text-muted-foreground">
                        {s.ar}
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      {s.n} · {pct}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${bar}%`,
                        background: `linear-gradient(90deg, oklch(0.65 0.16 ${s.hue}), oklch(0.55 0.14 ${s.hue}))`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="text-sm font-semibold mb-5 flex items-center gap-2">
            🏥 Répartition par CHU
          </div>
          {chuRanked.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center">
              Aucun cas encore enregistré.
            </div>
          ) : (
            <div className="space-y-3">
              {chuRanked.map((c) => {
                const pct = total ? Math.round((c.n / total) * 100) : 0;
                const bar = total ? (c.n / maxChu) * 100 : 0;
                return (
                  <div key={c.hospital}>
                    <div className="flex items-center justify-between text-sm mb-1 gap-2">
                      <span className="flex items-center gap-2 min-w-0">
                        <span>🏥</span>
                        <span className="font-medium truncate">{c.hospital}</span>
                        <a
                          href={googleMapsUrl(c.hospital)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md text-muted-foreground hover:bg-secondary hover:text-primary transition shrink-0"
                          aria-label={`Ouvrir ${c.hospital} sur Google Maps`}
                          title="Voir sur Google Maps"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </a>
                      </span>
                      <span className="text-muted-foreground shrink-0">
                        {c.n} · {pct}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all bg-primary"
                        style={{ width: `${bar}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="text-sm font-semibold mb-4 flex items-center gap-2">
          🗺️ Carte des CHU actifs
        </div>
        <ChuMap cases={cases} />
      </div>


      {cases.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="text-sm font-semibold mb-4">🗂️ Derniers cas</div>
          <div className="divide-y divide-border">
            {cases.slice(0, 10).map((c) => {
              const s = SPECIALTIES.find((sp) => sp.id === c.specialty);
              return (
                <div
                  key={c.id}
                  className="py-3 flex items-start gap-3"
                >
                  <div className="text-xl">{s?.emoji || "🩺"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{c.diagnosis}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-1">
                      <span>{s?.fr}</span>
                      <span>·</span>
                      <span>{c.hospital}</span>
                      {c.hospital && (
                        <a
                          href={googleMapsUrl(c.hospital)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center p-0.5 rounded hover:text-primary transition"
                          aria-label={`Voir ${c.hospital} sur Google Maps`}
                          title="Voir sur Google Maps"
                        >
                          <MapPin className="w-3 h-3" />
                        </a>
                      )}
                      <span>·</span>
                      <span>{new Date(c.date).toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(c.id)}
                    className="text-muted-foreground hover:text-destructive p-1"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- AI Tab ---------------- */

function AITab() {
  return (
    <div className="max-w-2xl mx-auto text-center py-10">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-primary text-primary-foreground grid place-items-center text-4xl mb-6 shadow-2xl shadow-primary/30">
        🤖
      </div>
      <h2 className="font-display text-3xl md:text-4xl font-bold">
        Assistant IA Clinique
      </h2>
      <p className="text-muted-foreground mt-3 leading-relaxed">
        Bientôt : une IA évaluera vos cas cliniques, vérifiera la cohérence
        diagnostic/traitement, et vous suggérera des lectures pour progresser.
      </p>

      <div className="mt-8 grid sm:grid-cols-3 gap-3 text-left">
        {[
          { e: "🧠", t: "Analyse clinique", d: "Cohérence diagnostic ↔ traitement." },
          { e: "📚", t: "Ressources", d: "Références et guidelines suggérées." },
          { e: "✨", t: "Progression", d: "Feedback personnalisé sur vos notes." },
        ].map((f) => (
          <div
            key={f.t}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="text-2xl mb-2">{f.e}</div>
            <div className="font-semibold text-sm">{f.t}</div>
            <div className="text-xs text-muted-foreground mt-1">{f.d}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium">
        <Sparkles className="w-4 h-4" /> Bientôt disponible
      </div>
    </div>
  );
}

/* ---------------- Notifications Tab ---------------- */

function NotifTab({
  reminders,
  setReminders,
}: {
  reminders: boolean;
  setReminders: (v: boolean) => void;
}) {
  const enable = async () => {
    if (typeof Notification === "undefined") {
      toast.error("Notifications non supportées sur cet appareil.");
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        setReminders(true);
        localStorage.setItem(LS.reminders, "1");
        new Notification("🔔 Carnet de Stage", {
          body: "Super ! Les rappels sont activés. N'oubliez pas de noter vos cas aujourd'hui !",
          icon: "/favicon.ico",
        });
        toast.success("Rappels activés ✅");
      } else {
        toast.error("Permission refusée");
      }
    } catch {
      toast.error("Impossible d'activer les notifications.");
    }
  };

  const disable = () => {
    setReminders(false);
    localStorage.setItem(LS.reminders, "0");
    toast("Rappels désactivés");
  };

  return (
    <div className="max-w-2xl">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
        🔔 Rappels & Notifications
      </div>
      <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
        Ne perdez plus jamais un cas.
      </h2>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-semibold flex items-center gap-2">
              <span>📅</span> Rappels quotidiens
            </div>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Recevez une notification chaque jour pour vous rappeler
              d'enregistrer les cas de votre garde ou de votre stage.
            </p>
          </div>
          <div
            className={`w-12 h-7 rounded-full relative transition ${
              reminders ? "bg-primary" : "bg-secondary"
            }`}
          >
            <div
              className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition ${
                reminders ? "left-[22px]" : "left-0.5"
              }`}
            />
          </div>
        </div>

        <button
          onClick={reminders ? disable : enable}
          className={`mt-6 w-full py-3 rounded-xl font-semibold transition ${
            reminders
              ? "bg-secondary text-foreground hover:bg-secondary/80"
              : "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
          }`}
        >
          {reminders ? "Désactiver les rappels" : "Activer les notifications de rappel"}
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
        💡 <strong className="text-foreground">Astuce :</strong> installez
        l'application sur votre téléphone via le menu de votre navigateur
        (« Ajouter à l'écran d'accueil ») pour recevoir les rappels comme une
        vraie app.
      </div>
    </div>
  );
}

/* ---------------- Help Tab ---------------- */

function HelpTab() {
  return (
    <div className="max-w-2xl">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
        ℹ️ À propos
      </div>
      <h2 className="font-display text-3xl md:text-4xl font-bold mb-8">
        Aide & Concepteur
      </h2>

      <div className="space-y-4">
        <InfoCard emoji="👨‍⚕️" title="Conçu par">
          [Your Name Here]
        </InfoCard>
        <InfoCard emoji="📬" title="Contact">
          [Your Email/Socials Here]
        </InfoCard>
        <InfoCard emoji="📖" title="À propos du projet">
          [Your Project Description Here]
        </InfoCard>
      </div>

      <p className="font-arabic text-center text-primary/80 text-xl mt-10">
        « العلمُ صيدٌ وكتابتُه قيدٌ »
      </p>
    </div>
  );
}

function InfoCard({
  emoji,
  title,
  children,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl bg-secondary grid place-items-center text-2xl">
        {emoji}
      </div>
      <div className="flex-1">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          {title}
        </div>
        <div className="mt-1 text-foreground/80">{children}</div>
      </div>
    </div>
  );
}

/* ---------------- Case Modal ---------------- */

function CaseModal({
  specialty,
  hospital,
  existingCases,
  onDelete,
  onClose,
  onSave,
  onUpdate,
}: {
  specialty: Specialty;
  hospital: string;
  existingCases: CaseEntry[];
  onDelete: (id: string) => void;
  onClose: () => void;
  onSave: (c: CaseEntry) => Promise<boolean> | boolean;
  onUpdate: (id: string, c: CaseEntry) => Promise<boolean> | boolean;
}) {
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [photoFile, setPhotoFile] = useState<File | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [adding, setAdding] = useState(existingCases.length === 0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    if (photo?.startsWith("blob:")) URL.revokeObjectURL(photo);
    setDiagnosis("");
    setTreatment("");
    setNotes("");
    setPhoto(undefined);
    setPhotoFile(undefined);
    if (fileRef.current) fileRef.current.value = "";
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (photo && photo.startsWith("blob:")) URL.revokeObjectURL(photo);
    };
  }, [photo]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Merci de choisir une image.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image trop volumineuse (max 8 Mo).");
      return;
    }
    setPhotoFile(file);
    setPhoto(URL.createObjectURL(file));
  };

  const startEdit = (c: CaseEntry) => {
    if (photo?.startsWith("blob:")) URL.revokeObjectURL(photo);
    setEditingId(c.id);
    setDiagnosis(c.diagnosis);
    setTreatment(c.treatment || "");
    setNotes(c.notes || "");
    setPhoto(c.photo);
    setPhotoFile(undefined);
    setAdding(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      toast.error("Ajoutez un diagnostic.");
      return;
    }
    setUploading(true);
    try {
      const payload: CaseEntry = {
        id: editingId ?? crypto.randomUUID(),
        specialty: specialty.id,
        diagnosis: diagnosis.trim(),
        treatment: treatment.trim(),
        notes: notes.trim(),
        photoFile,
        hospital,
        date: new Date().toISOString(),
      };
      const saved = editingId
        ? await onUpdate(editingId, payload)
        : await onSave(payload);
      if (saved) {
        resetForm();
        setEditingId(null);
        setAdding(false);
      }
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />
      <div className="relative w-full md:max-w-2xl bg-card border border-border rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-4">
        <div
          className="sticky top-0 z-10 flex items-center gap-3 px-6 py-4 border-b border-border bg-card/95 backdrop-blur"
        >
          <div
            className="w-11 h-11 rounded-xl grid place-items-center text-2xl"
            style={{ background: `oklch(0.94 0.06 ${specialty.hue})` }}
          >
            {specialty.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-lg font-bold leading-tight">
              {adding ? (editingId ? "Modifier le cas" : "Nouveau cas") : "Cas précédents"} · {specialty.fr}
            </div>
            <div className="text-xs text-muted-foreground">
              🏥 {hospital}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!adding && (
            <div className="space-y-4">
              {existingCases.length > 0 ? (
                <div className="space-y-3">
                  {existingCases.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-border bg-background p-4 flex items-start gap-3"
                    >
                      {c.photo ? (
                        <img
                          src={c.photo}
                          alt={`Photo du cas ${c.diagnosis}`}
                          className="w-16 h-16 rounded-xl object-cover border border-border shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-secondary grid place-items-center text-2xl shrink-0">
                          {specialty.emoji}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm leading-tight">
                          {c.diagnosis}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {c.hospital || hospital} · {new Date(c.date).toLocaleDateString("fr-FR")}
                        </div>
                        {c.treatment && (
                          <div className="text-sm mt-3">
                            <span className="font-medium">Traitement :</span> {c.treatment}
                          </div>
                        )}
                        {c.notes && (
                          <div className="text-sm text-foreground/80 mt-2 whitespace-pre-wrap">
                            {c.notes}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          className="p-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition"
                          aria-label="Modifier ce cas"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(c.id)}
                          className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
                          aria-label="Supprimer ce cas"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Aucun cas enregistré dans cette spécialité.
                </div>
              )}

              <button
                type="button"
                onClick={() => setAdding(true)}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition"
              >
                <Plus className="w-4 h-4 inline-block mr-2" /> Ajouter un nouveau cas
              </button>
            </div>
          )}

          {adding && (
        <form onSubmit={submit} className="space-y-6">
          {/* Diagnosis */}
          <div>
            <label className="text-sm font-semibold flex items-center gap-2">
              🩺 Le Diagnostic
            </label>
            <input
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              autoFocus
              placeholder="ex: Infarctus du myocarde"
              className="mt-2 w-full px-4 py-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground py-1">
                Suggestions :
              </span>
              {specialty.suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setDiagnosis(s)}
                  className="px-3 py-1 rounded-full text-xs bg-secondary hover:bg-secondary/70 border border-border transition"
                >
                  ✨ {s}
                </button>
              ))}
            </div>
          </div>

          {/* Treatment */}
          <div>
            <label className="text-sm font-semibold flex items-center gap-2">
              💊 Le Traitement
            </label>
            <input
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              placeholder="ex: Aspirine 250mg, Clopidogrel, Enoxaparine…"
              className="mt-2 w-full px-4 py-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-semibold flex items-center gap-2">
              📝 Remarques / Notes cliniques
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Contexte, présentation clinique, ce que vous avez appris…"
              className="mt-2 w-full px-4 py-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Photo */}
          <div>
            <label className="text-sm font-semibold flex items-center gap-2">
              📸 Souvenir Photo
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleFile(f);
              }}
              onClick={() => fileRef.current?.click()}
              className={`mt-2 cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition ${
                drag
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-secondary/50"
              }`}
            >
              {photo ? (
                <div className="relative inline-block">
                  <img
                    src={photo}
                    alt="Aperçu"
                    className="max-h-52 rounded-xl mx-auto"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhoto(undefined);
                      setPhotoFile(undefined);

                    }}
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-destructive text-destructive-foreground grid place-items-center shadow"
                    aria-label="Retirer la photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Camera className="w-8 h-8 mx-auto text-muted-foreground" />
                  <div className="mt-2 text-sm font-medium">
                    Cliquez ou glissez une photo
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Radio, ECG, échographie, ou photo de garde 📷
                  </div>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (existingCases.length > 0) {
                  resetForm();
                  setEditingId(null);
                  setAdding(false);
                } else {
                  onClose();
                }
              }}
              className="px-5 py-3 rounded-xl border border-border hover:bg-secondary font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-60"
            >
              {uploading
                ? "Enregistrement..."
                : editingId
                ? "✏️ Mettre à jour"
                : "💾 Enregistrer le cas"}
            </button>

          </div>
        </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- CHU Map (Leaflet) ---------------- */

declare global {
  interface Window {
    L?: any;
  }
}

function ChuMap({ cases }: { cases: CaseEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  const chuAgg = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of cases) {
      if (c.hospital && CHU_COORDS[c.hospital]) {
        m[c.hospital] = (m[c.hospital] || 0) + 1;
      }
    }
    return Object.entries(m).map(([hospital, n]) => ({
      hospital,
      n,
      ...CHU_COORDS[hospital],
    }));
  }, [cases]);

  useEffect(() => {
    let cancelled = false;
    const start = Date.now();
    const init = () => {
      if (cancelled) return;
      const L = window.L;
      if (!L) {
        if (Date.now() - start < 8000) {
          setTimeout(init, 150);
        }
        return;
      }
      if (!ref.current) return;
      if (!mapRef.current) {
        mapRef.current = L.map(ref.current, {
          center: [28.5, 2.5],
          zoom: 5,
          scrollWheelZoom: false,
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap",
        }).addTo(mapRef.current);
      }
      // refresh markers
      if (layerRef.current) {
        mapRef.current.removeLayer(layerRef.current);
      }
      const group = L.layerGroup();
      const maxN = Math.max(1, ...chuAgg.map((x) => x.n));
      chuAgg.forEach((c) => {
        const radius = 8 + Math.round((c.n / maxN) * 16);
        const marker = L.circleMarker([c.lat, c.lng], {
          radius,
          color: "#0f766e",
          weight: 2,
          fillColor: "#14b8a6",
          fillOpacity: 0.55,
        });
        const link = googleMapsUrl(c.hospital);
        marker.bindPopup(
          `<div style="font-family:system-ui;font-size:13px;line-height:1.4">
            <div style="font-weight:600">🏥 ${c.hospital}</div>
            <div style="color:#64748b;margin:2px 0 6px">${c.n} cas enregistré${c.n > 1 ? "s" : ""}</div>
            <a href="${link}" target="_blank" rel="noopener" style="color:#0f766e;font-weight:500">Ouvrir dans Google Maps →</a>
          </div>`,
        );
        marker.addTo(group);
      });
      group.addTo(mapRef.current);
      layerRef.current = group;
      if (chuAgg.length > 0) {
        const bounds = L.latLngBounds(chuAgg.map((c) => [c.lat, c.lng]));
        mapRef.current.fitBounds(bounds.pad(0.35), { maxZoom: 7 });
      }
      setTimeout(() => mapRef.current?.invalidateSize(), 50);
    };
    init();
    return () => {
      cancelled = true;
    };
  }, [chuAgg]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  if (chuAgg.length === 0) {
    return (
      <div className="h-64 rounded-xl border border-dashed border-border grid place-items-center text-sm text-muted-foreground">
        Aucun CHU actif pour l'instant.
      </div>
    );
  }
  return (
    <div
      ref={ref}
      className="h-80 w-full rounded-xl overflow-hidden border border-border"
      style={{ background: "#e2e8f0" }}
    />
  );
}

