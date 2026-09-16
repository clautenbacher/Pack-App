const SUPABASE_URL = 'https://uvolbvrzakcrhizhspgv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2b2xidnJ6YWtjcmhpemhzcGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMTc3ODksImV4cCI6MjEwMzg5Mzc4OX0.TaHFzj6zUvjvQpuDZEuULbcxbMltIAr_MqKM9cqKOvE';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function App() {
  const [session, setSession] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [authError, setAuthError] = React.useState('');

  const [items, setItems] = React.useState([]);
  const [newItemText, setNewItemText] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('Bekleidung');

  // Session prüfen & Auth-State Listener
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Items laden, wenn eingeloggt
  React.useEffect(() => {
    if (session) {
      fetchItems();
    }
  }, [session]);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('pack_items')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) console.error('Fehler beim Laden:', error);
    else setItems(data || []);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setAuthError(error.message);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
    }
  };

  const handleSignOut = () => {
    supabase.auth.signOut();
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const { data, error } = await supabase
      .from('pack_items')
      .insert([
        {
          name: newItemText.trim(),
          category: selectedCategory,
          packed: false,
          user_id: session.user.id
        }
      ])
      .select();

    if (error) {
      alert('Fehler beim Hinzufügen: ' + error.message);
    } else {
      setItems([...items, data[0]]);
      setNewItemText('');
    }
  };

  const togglePacked = async (id, currentStatus) => {
    const { error } = await supabase
      .from('pack_items')
      .update({ packed: !currentStatus })
      .eq('id', id);

    if (error) {
      alert('Fehler beim Aktualisieren: ' + error.message);
    } else {
      setItems(items.map(item => item.id === id ? { ...item, packed: !item.packed } : item));
    }
  };

  const deleteItem = async (id) => {
    const { error } = await supabase
      .from('pack_items')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Fehler beim Löschen: ' + error.message);
    } else {
      setItems(items.filter(item => item.id !== id));
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-charcoal">Lade App...</div>;
  }

  // LOGIN / REGISTRIERUNG VIEW
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgSoft p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-sand w-full max-w-md">
          <h1 className="text-2xl font-bold text-charcoal mb-2 text-center">Pack-App</h1>
          <p className="text-sm text-muted text-center mb-6">
            {isSignUp ? 'Erstelle ein Konto für deine persönliche Liste' : 'Melde dich an, um deine Liste zu sehen'}
          </p>

          {authError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase mb-1">E-Mail</label>
              <input
                type="email"
                required
                className="w-full p-3 rounded-lg border border-sand focus:outline-none focus:border-sage"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase mb-1">Passwort</label>
              <input
                type="password"
                required
                className="w-full p-3 rounded-lg border border-sand focus:outline-none focus:border-sage"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-sage text-white font-semibold p-3 rounded-lg hover:opacity-90 transition"
            >
              {isSignUp ? 'Konto erstellen' : 'Anmelden'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-muted hover:text-charcoal underline"
            >
              {isSignUp ? 'Bereits ein Konto? Hier anmelden' : 'Noch kein Konto? Jetzt registrieren'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // HAUPT-APP VIEW (Eingeloggt)
  return (
    <div className="min-h-screen bg-bgSoft p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-sand p-6 md:p-8">
        
        {/* Header mit Abmelden-Button */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-sand">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">Pack-App</h1>
            <p className="text-xs text-muted">{session.user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-xs bg-bgSoft text-muted px-3 py-2 rounded-lg hover:bg-sand transition"
          >
            Abmelden
          </button>
        </div>

        {/* Neues Item Formular */}
        <form onSubmit={addItem} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Neuer Gegenstand..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            className="flex-1 p-3 rounded-lg border border-sand focus:outline-none focus:border-sage"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-3 rounded-lg border border-sand bg-white text-charcoal focus:outline-none focus:border-sage"
          >
            <option value="Bekleidung">Bekleidung</option>
            <option value="Kulturbeutel">Kulturbeutel</option>
            <option value="Elektronik">Elektronik</option>
            <option value="Dokumente">Dokumente</option>
            <option value="Sonstiges">Sonstiges</option>
          </select>
          <button
            type="submit"
            className="bg-sage text-white font-semibold px-5 rounded-lg hover:opacity-90 transition"
          >
            +
          </button>
        </form>

        {/* Liste anzeigen */}
        <div className="space-y-2">
          {items.length === 0 ? (
            <p className="text-center text-muted py-8">Deine Packliste ist noch leer.</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg border border-sand hover:bg-bgSoft transition"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.packed}
                    onChange={() => togglePacked(item.id, item.packed)}
                    className="w-5 h-5 accent-sage cursor-pointer"
                  />
                  <span className={`font-medium ${item.packed ? 'line-through text-muted' : 'text-charcoal'}`}>
                    {item.name}
                  </span>
                  <span className="text-xs px-2 py-1 bg-bgSoft text-muted rounded-md border border-sand">
                    {item.category}
                  </span>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-muted hover:text-red-500 text-sm px-2"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);