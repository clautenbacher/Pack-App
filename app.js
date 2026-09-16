const { useState, useEffect } = React;

// Supabase Initialisierung

const SUPABASE_URL = 'https://uvolbvrzakcrhizhspgv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2b2xidnJ6YWtjcmhpemhzcGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMTc3ODksImV4cCI6MjEwMzg5Mzc4OX0.TaHFzj6zUvjvQpuDZEuULbcxbMltIAr_MqKM9cqKOvE';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function App() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Anwendungs-Daten
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState('');
  const [newListName, setNewListName] = useState('');

  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [categories, setCategories] = useState(['Elektronik', 'Kleidung', 'Dokumente', 'Hygiene']);
  const [selectedCategory, setSelectedCategory] = useState('Kleidung');
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Personen-Verwaltung
  const [people, setPeople] = useState(['Christian', 'Miriam', 'Noah', 'Elina']);
  const [assignedPerson, setAssignedPerson] = useState('Christian');
  const [newPersonName, setNewPersonName] = useState('');
  
  const [filterPerson, setFilterPerson] = useState('Alle');
  const [filterCategory, setFilterCategory] = useState('Alle');

  // 1. Auth & Session Management
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchLists(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchLists(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Listen
  const fetchLists = async (userId) => {
    const { data, error } = await supabase.from('lists').select('*').eq('user_id', userId);
    if (!error && data) {
      setLists(data);
      if (data.length > 0) {
        setSelectedListId(data[0].id);
      }
    }
  };

  // Fetch Items für die gewählte Liste
  useEffect(() => {
    if (selectedListId && session) {
      fetchItems(selectedListId);
    }
  }, [selectedListId, session]);

  const fetchItems = async (listId) => {
    const { data, error } = await supabase.from('pack_items').select('*').eq('list_id', listId);
    if (!error && data) {
      setItems(data);
    }
  };

  // Auth Aktionen
  const handleAuth = async (type) => {
    setLoading(true);
    const { error } = type === 'login' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  // 2. Liste anlegen
  const createList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    const { data, error } = await supabase.from('lists').insert([
      { name: newListName.trim(), user_id: session.user.id }
    ]).select();

    if (!error && data) {
      setLists([...lists, data[0]]);
      setSelectedListId(data[0].id);
      setNewListName('');
    }
  };

  // 3. Item hinzufügen
  const addItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !selectedListId) return;

    const newItem = {
      name: newItemName.trim(),
      category: selectedCategory,
      person: assignedPerson,
      packed: false,
      list_id: selectedListId,
      user_id: session.user.id
    };

    const { data, error } = await supabase.from('pack_items').insert([newItem]).select();
    if (error) {
      alert('Fehler beim Hinzufügen: ' + error.message);
    } else if (data) {
      setItems([...items, data[0]]);
      setNewItemName('');
    }
  };

  // 4. Status (gepackt/entpackt) umschalten
  const togglePacked = async (id, currentStatus) => {
    const { error } = await supabase.from('pack_items').update({ packed: !currentStatus }).eq('id', id);
    if (!error) {
      setItems(items.map(item => item.id === id ? { ...item, packed: !currentStatus } : item));
    }
  };

  // 5. Alles demarkieren
  const uncheckAll = async () => {
    const itemIds = filteredItems.map(i => i.id);
    if (itemIds.length === 0) return;

    const { error } = await supabase
      .from('pack_items')
      .update({ packed: false })
      .in('id', itemIds);

    if (!error) {
      setItems(items.map(item => itemIds.includes(item.id) ? { ...item, packed: false } : item));
    }
  };

  // 6. Neue Kategorie hinzufügen
  const addCategory = (e) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (name && !categories.includes(name)) {
      setCategories([...categories, name]);
      setSelectedCategory(name);
      setNewCategoryName('');
    }
  };

  // 7. Neue Person hinzufügen
  const addPerson = (e) => {
    e.preventDefault();
    const name = newPersonName.trim();
    if (name && !people.includes(name)) {
      setPeople([...people, name]);
      setAssignedPerson(name);
      setNewPersonName('');
    }
  };

  // Gefilterte Items
  const filteredItems = items.filter(item => {
    const matchPerson = filterPerson === 'Alle' || item.person === filterPerson;
    const matchCat = filterCategory === 'Alle' || item.category === filterCategory;
    return matchPerson && matchCat;
  });

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-4 text-center">Pack-App Login</h1>
          <input className="w-full border p-2 mb-2 rounded" type="email" placeholder="E-Mail" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="w-full border p-2 mb-4 rounded" type="password" placeholder="Passwort" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="w-full bg-emerald-600 text-white p-2 rounded mb-2" onClick={() => handleAuth('login')} disabled={loading}>Anmelden</button>
          <button className="w-full bg-gray-200 text-gray-800 p-2 rounded" onClick={() => handleAuth('signup')} disabled={loading}>Registrieren</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold text-emerald-800">Pack-App 🧳</h1>
        <button onClick={() => supabase.auth.signOut()} className="text-sm text-red-500 hover:underline">Abmelden</button>
      </div>

      {/* 1. Listen-Auswahl & Erstellung */}
      <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
        <h2 className="font-semibold text-gray-700">1. Liste auswählen oder erstellen</h2>
        <div className="flex gap-2">
          <select className="border p-2 rounded flex-1" value={selectedListId} onChange={e => setSelectedListId(e.target.value)}>
            {lists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <form onSubmit={createList} className="flex gap-2">
          <input className="border p-2 rounded flex-1" type="text" placeholder="Neue Liste (z.B. Wandern, Business)..." value={newListName} onChange={e => setNewListName(e.target.value)} />
          <button className="bg-emerald-700 text-white px-4 py-2 rounded">+ Liste</button>
        </form>
      </div>

      {/* 2. Item hinzufügen */}
      {selectedListId && (
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
          <h2 className="font-semibold text-gray-700">2. Gegenstand hinzufügen</h2>
          <form onSubmit={addItem} className="space-y-2">
            <input className="w-full border p-2 rounded" type="text" placeholder="Gegenstand name..." value={newItemName} onChange={e => setNewItemName(e.target.value)} />
            <div className="flex gap-2">
              <select className="border p-2 rounded flex-1" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="border p-2 rounded flex-1" value={assignedPerson} onChange={e => setAssignedPerson(e.target.value)}>
                {people.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <button className="bg-emerald-700 text-white px-4 py-2 rounded">Hinzufügen</button>
            </div>
          </form>

          {/* Neue Kategorie & Neue Person anlegen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t">
            <form onSubmit={addCategory} className="flex gap-2">
              <input className="border p-1 text-sm rounded flex-1" type="text" placeholder="+ Neue Kategorie..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
              <button className="bg-gray-200 text-sm px-3 py-1 rounded">Kategorie Speichern</button>
            </form>

            <form onSubmit={addPerson} className="flex gap-2">
              <input className="border p-1 text-sm rounded flex-1" type="text" placeholder="+ Neue Person..." value={newPersonName} onChange={e => setNewPersonName(e.target.value)} />
              <button className="bg-gray-200 text-sm px-3 py-1 rounded">Person Speichern</button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Filter & Aktionen */}
      <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-gray-700">Filter & Aktionen</h2>
          <button onClick={uncheckAll} className="bg-amber-100 text-amber-800 text-xs px-3 py-1.5 rounded hover:bg-amber-200 font-medium">
            🔄 Alles demarkieren
          </button>
        </div>
        <div className="flex gap-2">
          <select className="border p-2 rounded text-sm flex-1" value={filterPerson} onChange={e => setFilterPerson(e.target.value)}>
            <option value="Alle">Alle Personen</option>
            {people.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="border p-2 rounded text-sm flex-1" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="Alle">Alle Kategorien</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* 4. Packliste Anzeige */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-3">Packliste ({filteredItems.length} Elemente)</h2>
        <div className="space-y-2">
          {filteredItems.map(item => (
            <div key={item.id} onClick={() => togglePacked(item.id, item.packed)} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={item.packed} onChange={() => {}} className="h-5 w-5 text-emerald-600 rounded" />
                <span className={item.packed ? 'line-through text-gray-400' : 'text-gray-800 font-medium'}>
                  {item.name}
                </span>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">{item.category}</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{item.person}</span>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Keine Gegenstände gefunden.</p>}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);