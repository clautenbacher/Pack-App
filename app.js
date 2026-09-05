const SUPABASE_URL = 'https://uvolbvrzakcrhizhspgv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2b2xidnJ6YWtjcmhpemhzcGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMTc3ODksImV4cCI6MjEwMzg5Mzc4OX0.TaHFzj6zUvjvQpuDZEuULbcxbMltIAr_MqKM9cqKOvE';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const { useState, useEffect } = React;

function App() {
  // Nutzerverwaltung
  const [userList, setUserList] = useState(['Christian', 'Miriam']);
  const [currentUser, setCurrentUser] = useState('Christian');
  const [newUserInput, setNewUserInput] = useState('');

  // Packliste & Kategorien aus der Cloud
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(['Allgemein', 'Kleidung', 'Elektronik', 'Dokumente', 'Spielzeug']);
  const [loading, setLoading] = useState(true);

  // Formular-Zustände für neuen Gegenstand
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Allgemein');
  const [newItemPerson, setNewItemPerson] = useState('Alle');

  // Filter-Zustände
  const [filterCategory, setFilterCategory] = useState('Alle');
  const [filterPerson, setFilterPerson] = useState('Alle');

  // Neue Kategorie
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // 1. Daten aus Supabase laden, wenn sich der Nutzer ändert
  useEffect(() => {
    fetchItems();
  }, [currentUser]);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pack_items')
      .select('*')
      .eq('user_name', currentUser);

    if (error) {
      console.error('Fehler beim Laden:', error.message);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  // 2. Gegenstand hinzufügen
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem = {
      text: newItemText.trim(),
      category: newItemCategory,
      person: newItemPerson,
      checked: false,
      user_name: currentUser
    };

    const { data, error } = await supabase
      .from('pack_items')
      .insert([newItem])
      .select();

    if (error) {
      console.error('Fehler beim Hinzufügen:', error.message);
      alert('Fehler beim Speichern: ' + error.message);
    } else if (data) {
      setItems([...items, ...data]);
      setNewItemText('');
    }
  };

  // 3. Abhaken (Status umschalten)
  const handleToggleCheck = async (id, currentChecked) => {
    // Optimistisches Update im UI
    setItems(items.map(item => item.id === id ? { ...item, checked: !currentChecked } : item));

    const { error } = await supabase
      .from('pack_items')
      .update({ checked: !currentChecked })
      .eq('id', id);

    if (error) {
      console.error('Fehler beim Aktualisieren:', error.message);
      fetchItems();
    }
  };

  // 4. Gegenstand löschen
  const handleDeleteItem = async (id) => {
    setItems(items.filter(item => item.id !== id));

    const { error } = await supabase
      .from('pack_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Fehler beim Löschen:', error.message);
      fetchItems();
    }
  };

  // 5. Alle Gegenstände demarkieren (Häkchen zurücksetzen)
  const handleResetAll = async () => {
    const confirmed = window.confirm(
      `Möchtest du wirklich alle Häkchen für ${currentUser} zurücksetzen?`
    );
    if (!confirmed) return;

    // Optimistisches Update im UI
    setItems(items.map(item => ({ ...item, checked: false })));

    // Alle Einträge in Supabase auf checked = false setzen
    const { error } = await supabase
      .from('pack_items')
      .update({ checked: false })
      .eq('user_name', currentUser);

    if (error) {
      console.error('Fehler beim Zurücksetzen:', error.message);
      alert('Fehler beim Zurücksetzen: ' + error.message);
      fetchItems();
    }
  };

  // 6. Nutzer hinzufügen
  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUserInput.trim()) return;
    if (!userList.includes(newUserInput.trim())) {
      setUserList([...userList, newUserInput.trim()]);
      setCurrentUser(newUserInput.trim());
    }
    setNewUserInput('');
  };

  // 7. Kategorie hinzufügen
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryInput.trim()) return;
    if (!categories.includes(newCategoryInput.trim())) {
      setCategories([...categories, newCategoryInput.trim()]);
    }
    setNewCategoryInput('');
  };

  // Filter anwenden
  const filteredItems = items.filter(item => {
    const matchCat = filterCategory === 'Alle' || item.category === filterCategory;
    const matchPer = filterPerson === 'Alle' || item.person === filterPerson;
    return matchCat && matchPer;
  });

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 font-sans text-charcoal min-h-screen">
      {/* Header & Nutzerwechsel */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-sage-dark">Pack-App 🧳</h1>
          <p className="text-xs uppercase tracking-wider text-muted font-medium mt-0.5">
            Produced by <span className="font-bold text-sage-dark">Lautenbacher CORE Productions</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Profil:</label>
          <select 
            value={currentUser} 
            onChange={(e) => setCurrentUser(e.target.value)}
            className="p-2 border rounded bg-white font-semibold"
          >
            {userList.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Neues Profil hinzufügen */}
      <details className="mb-6 bg-white p-3 rounded border text-sm">
        <summary className="cursor-pointer text-sage font-medium">+ Neues Profil erstellen</summary>
        <form onSubmit={handleAddUser} className="flex gap-2 mt-2">
          <input 
            type="text" 
            placeholder="Name eingeben..." 
            value={newUserInput} 
            onChange={(e) => setNewUserInput(e.target.value)}
            className="p-2 border rounded flex-1"
          />
          <button type="submit" className="bg-sage text-white px-3 py-1 rounded">Erstellen</button>
        </form>
      </details>

      {/* Formular: Neuen Gegenstand hinzufügen */}
      <section className="bg-white p-4 rounded-lg shadow-sm mb-6 border">
        <h2 className="text-lg font-semibold mb-3">Neuen Gegenstand hinzufügen</h2>
        <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="Was muss mit? (z.B. Ladekabel)..." 
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            className="p-2 border rounded flex-1"
          />
          <select 
            value={newItemCategory} 
            onChange={(e) => setNewItemCategory(e.target.value)}
            className="p-2 border rounded"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select 
            value={newItemPerson} 
            onChange={(e) => setNewItemPerson(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="Alle">Für Alle</option>
            <option value="Christian">Christian</option>
            <option value="Miriam">Miriam</option>
            <option value="Kind 1">Kind 1</option>
            <option value="Kind 2">Kind 2</option>
          </select>
          <button type="submit" className="bg-sage hover:bg-sage-dark text-white px-4 py-2 rounded font-medium">
            Hinzufügen
          </button>
        </form>

        {/* Neue Kategorie hinzufügen */}
        <details className="mt-3 text-xs text-muted">
          <summary className="cursor-pointer">+ Neue Kategorie anlegen</summary>
          <form onSubmit={handleAddCategory} className="flex gap-2 mt-2">
            <input 
              type="text" 
              placeholder="Kategoriename..." 
              value={newCategoryInput} 
              onChange={(e) => setNewCategoryInput(e.target.value)}
              className="p-1 border rounded text-xs flex-1"
            />
            <button type="submit" className="bg-sand text-charcoal px-2 py-1 rounded">Hinzufügen</button>
          </form>
        </details>
      </section>

      {/* Filter-Bereich */}
      <section className="flex flex-wrap gap-4 mb-4 bg-sand/30 p-3 rounded">
        <div>
          <label className="text-xs font-semibold block mb-1">Filter Kategorie:</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="p-1 text-sm border rounded bg-white">
            <option value="Alle">Alle Kategorien</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1">Filter Person:</label>
          <select value={filterPerson} onChange={(e) => setFilterPerson(e.target.value)} className="p-1 text-sm border rounded bg-white">
            <option value="Alle">Alle Personen</option>
            <option value="Christian">Christian</option>
            <option value="Miriam">Miriam</option>
            <option value="Kind 1">Kind 1</option>
            <option value="Kind 2">Kind 2</option>
          </select>
        </div>
      </section>

      {/* Packliste anzeigen */}
      <section className="bg-white p-4 rounded-lg shadow-sm border mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Packliste von <span className="text-sage-dark">{currentUser}</span>
          </h2>
          {items.length > 0 && (
            <button
              onClick={handleResetAll}
              className="text-xs bg-sand/80 hover:bg-sand text-charcoal font-medium px-3 py-1.5 rounded-lg transition-colors border"
              title="Setzt alle Häkchen für den nächsten Urlaub zurück"
            >
              🔄 Alle demarkieren
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-muted text-sm italic py-4">Lade Daten aus der Cloud...</p>
        ) : filteredItems.length === 0 ? (
          <p className="text-muted text-sm italic py-4">Keine Gegenstände gefunden.</p>
        ) : (
          <ul className="divide-y">
            {filteredItems.map(item => (
              <li key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={item.checked} 
                    onChange={() => handleToggleCheck(item.id, item.checked)}
                    className="w-5 h-5 accent-sage rounded cursor-pointer"
                  />
                  <span className={item.checked ? 'line-through text-muted' : 'font-medium'}>
                    {item.text}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-sand/60 px-2 py-0.5 rounded text-charcoal">{item.category}</span>
                  <span className="bg-sage/20 px-2 py-0.5 rounded text-sage-dark">{item.person}</span>
                  <button 
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-400 hover:text-red-600 ml-2 font-bold"
                    title="Löschen"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);