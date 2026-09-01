const { useState, useEffect } = React;

function App() {
  // States für Nutzer & Listen
  const [user, setUser] = useState(() => localStorage.getItem('packapp_user') || '');
  const [usernameInput, setUsernameInput] = useState('');
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('packapp_items');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Reisepass & Dokumente', category: 'Handgepäck', checked: false },
      { id: 2, text: 'Ladekabel & Powerbank', category: 'Elektronik', checked: false },
      { id: 3, text: 'Kulturtasche', category: 'Bad', checked: false }
    ];
  });
  
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Allgemein');

  // Speichern im LocalStorage bei Änderungen
  useEffect(() => {
    localStorage.setItem('packapp_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('packapp_user', user);
  }, [user]);

  // Nutzer-Login / Profil wechseln
  const handleLogin = (e) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      setUser(usernameInput.trim());
      setUsernameInput('');
    }
  };

  const handleLogout = () => {
    setUser('');
  };

  // Item hinzufügen
  const addItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const newItem = {
      id: Date.now(),
      text: newItemText.trim(),
      category: newItemCategory,
      checked: false
    };
    setItems([...items, newItem]);
    setNewItemText('');
  };

  // Checkbox Toggle mit Haptik
  const toggleItem = (id) => {
    if (navigator.vibrate) navigator.vibrate(10);
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  // Einzelnes Item löschen
  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Alle markieren / demarkieren
  const toggleAll = (status) => {
    setItems(items.map(item => ({ ...item, checked: status })));
  };

  // Liste komplett zurücksetzen
  const resetList = () => {
    if (confirm('Möchtest du wirklich alle Einträge aus der Liste löschen?')) {
      setItems([]);
    }
  };

  // WhatsApp-Share
  const shareWhatsApp = () => {
    const openItems = items.filter(i => !i.checked).map(i => `• ${i.text}`).join('\n');
    const text = `*Packliste von ${user || 'mir'}*\n\n*Noch zu packen:*\n${openItems || 'Alles erledigt! 🎉'}\n\nErstellt mit der Pack-App 🧳`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Fortschritt berechnen
  const checkedCount = items.filter(i => i.checked).length;
  const progressPercent = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F9F9FB] text-charcoal pb-12">
      {/* Fortschrittsbalken oben */}
      <div className="w-full bg-gray-200 h-1.5 fixed top-0 left-0 z-50">
        <div 
          className="bg-sage h-1.5 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="max-w-md mx-auto px-4 pt-6">
        
        {/* Header & Nutzertrennung */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Pack-App 🧳</h1>
            <p className="text-xs text-muted">
              {user ? `Eingeloggt als: ${user}` : 'Gast-Modus'}
            </p>
          </div>
          {user ? (
            <button onClick={handleLogout} className="text-xs text-red-500 underline">
              Abmelden
            </button>
          ) : null}
        </div>

        {/* Login-Feld (falls nicht eingeloggt) */}
        {!user && (
          <form onSubmit={handleLogin} className="mb-6 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <label className="block text-xs font-semibold text-muted mb-2">Nutzerprofil wechseln / anlegen:</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Dein Name (z. B. Christian)" 
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border rounded-xl outline-none focus:border-sage"
              />
              <button type="submit" className="bg-sage text-white px-4 py-2 rounded-xl text-sm font-medium">
                Setzen
              </button>
            </div>
          </form>
        )}

        {/* Neues Item hinzufügen */}
        <form onSubmit={addItem} className="mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-col gap-2">
            <input 
              type="text" 
              placeholder="Neuer Gegenstand..." 
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-xl outline-none focus:border-sage"
            />
            <div className="flex gap-2">
              <select 
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="text-xs bg-gray-50 border rounded-xl px-3 py-2 text-muted outline-none"
              >
                <option value="Allgemein">Allgemein</option>
                <option value="Kleidung">Kleidung</option>
                <option value="Elektronik">Elektronik</option>
                <option value="Bad & Pflege">Bad & Pflege</option>
                <option value="Dokumente">Dokumente</option>
              </select>
              <button type="submit" className="flex-1 bg-sage text-white text-sm font-medium py-2 rounded-xl active:scale-95 transition-transform">
                + Hinzufügen
              </button>
            </div>
          </div>
        </form>

        {/* Aktions-Leiste (Alle markieren / WhatsApp / Reset) */}
        <div className="flex justify-between items-center mb-4 text-xs">
          <div className="flex gap-2">
            <button onClick={() => toggleAll(true)} className="text-sage font-medium">Alle abhaken</button>
            <span className="text-gray-300">|</span>
            <button onClick={() => toggleAll(false)} className="text-muted">Alle öffnen</button>
          </div>
          <button onClick={shareWhatsApp} className="text-sage font-medium flex items-center gap-1">
            <span>📲 via WhatsApp</span>
          </button>
        </div>

        {/* Die Packliste */}
        <div className="space-y-2 mb-8">
          {items.length === 0 && (
            <p className="text-center text-sm text-muted py-8">Deine Packliste ist noch leer.</p>
          )}

          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 transition-all duration-300 shadow-sm ${
                item.checked ? 'opacity-50 line-through bg-gray-50' : ''
              }`}
            >
              <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleItem(item.id)}>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-transform active:scale-110 ${
                    item.checked ? 'bg-sage border-sage text-white' : 'border-sand bg-transparent'
                  }`}
                >
                  {item.checked && <span className="text-xs font-bold">✓</span>}
                </div>
                <div>
                  <span className="text-base font-medium block">{item.text}</span>
                  <span className="text-[10px] text-muted uppercase tracking-wider">{item.category}</span>
                </div>
              </div>

              <button 
                onClick={() => deleteItem(item.id)}
                className="text-gray-300 hover:text-red-400 p-1 text-sm transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Fußzeile mit Reset */}
        {items.length > 0 && (
          <div className="text-center">
            <button onClick={resetList} className="text-xs text-red-400 hover:text-red-600 transition-colors">
              Liste zurücksetzen (Alle Einträge löschen)
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));