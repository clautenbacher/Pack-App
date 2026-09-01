const { useState, useEffect } = React;

function App() {
  // States für Nutzer, Items und Kategorien
  const [user, setUser] = useState(() => localStorage.getItem('packapp_user') || '');
  const [usernameInput, setUsernameInput] = useState('');
  
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('packapp_categories');
    return saved ? JSON.parse(saved) : ['Allgemein', 'Kleidung', 'Elektronik', 'Bad & Pflege', 'Dokumente'];
  });

  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('packapp_items');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Reisepass & Dokumente', category: 'Dokumente', checked: false },
      { id: 2, text: 'Ladekabel & Powerbank', category: 'Elektronik', checked: false },
      { id: 3, text: 'Kulturtasche', category: 'Bad & Pflege', checked: false }
    ];
  });
  
  const [newItemText, setNewItemText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Allgemein');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Alle');

  // Im LocalStorage speichern
  useEffect(() => {
    localStorage.setItem('packapp_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('packapp_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('packapp_user', user);
  }, [user]);

  // Eigene Kategorie hinzufügen
  const addCategory = (e) => {
    e.preventDefault();
    const catName = newCategoryInput.trim();
    if (catName && !categories.includes(catName)) {
      const updatedCategories = [...categories, catName];
      setCategories(updatedCategories);
      setSelectedCategory(catName);
      setNewCategoryInput('');
      setShowAddCategory(false);
    }
  };

  // Kategorie löschen
  const deleteCategory = (catToDelete) => {
    if (categories.length <= 1) return;
    if (confirm(`Kategorie "${catToDelete}" wirklich löschen?`)) {
      setCategories(categories.filter(c => c !== catToDelete));
      if (selectedCategory === catToDelete) {
        setSelectedCategory(categories[0]);
      }
    }
  };

  // Item hinzufügen
  const addItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const newItem = {
      id: Date.now(),
      text: newItemText.trim(),
      category: selectedCategory,
      checked: false
    };
    setItems([...items, newItem]);
    setNewItemText('');
  };

  // Toggle & Funktionen
  const toggleItem = (id) => {
    if (navigator.vibrate) navigator.vibrate(10);
    setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const toggleAll = (status) => {
    setItems(items.map(item => ({ ...item, checked: status })));
  };

  const resetList = () => {
    if (confirm('Möchtest du wirklich alle Einträge aus der Liste löschen?')) {
      setItems([]);
    }
  };

  const shareWhatsApp = () => {
    const openItems = items.filter(i => !i.checked).map(i => `• ${i.text} (${i.category})`).join('\n');
    const text = `*Packliste von ${user || 'mir'}*\n\n*Offen:*\n${openItems || 'Alles gepackt! 🎉'}\n\nErstellt mit der Pack-App 🧳`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Filter-Logik & Fortschritt
  const filteredItems = activeFilter === 'Alle' 
    ? items 
    : items.filter(item => item.category === activeFilter);

  const checkedCount = items.filter(i => i.checked).length;
  const progressPercent = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F9F9FB] text-charcoal pb-12">
      {/* Fortschrittsbalken */}
      <div className="w-full bg-gray-200 h-1.5 fixed top-0 left-0 z-50">
        <div 
          className="bg-sage h-1.5 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="max-w-md mx-auto px-4 pt-6">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Pack-App 🧳</h1>
            <p className="text-xs text-muted">
              {user ? `Nutzer: ${user}` : 'Gast-Modus'}
            </p>
          </div>
          {user && (
            <button onClick={() => setUser('')} className="text-xs text-red-400 underline">
              Wechseln
            </button>
          )}
        </div>

        {/* Profil-Formular */}
        {!user && (
          <form onSubmit={(e) => { e.preventDefault(); usernameInput && setUser(usernameInput); }} className="mb-6 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <label className="block text-xs font-semibold text-muted mb-2">Nutzername eintragen:</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Name" 
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border rounded-xl outline-none focus:border-sage"
              />
              <button type="submit" className="bg-sage text-white px-4 py-2 rounded-xl text-sm font-medium">
                Speichern
              </button>
            </div>
          </form>
        )}

        {/* Formular: Eintrag & Kategorien */}
        <div className="mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <form onSubmit={addItem} className="space-y-2">
            <input 
              type="text" 
              placeholder="Neuer Gegenstand..." 
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-xl outline-none focus:border-sage"
            />
            
            <div className="flex gap-2 items-center">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 text-xs bg-gray-50 border rounded-xl px-3 py-2 text-muted outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <button 
                type="button" 
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-charcoal px-3 py-2 rounded-xl"
              >
                + Kat.
              </button>

              <button type="submit" className="bg-sage text-white text-sm font-medium px-4 py-2 rounded-xl active:scale-95 transition-transform">
                + Hinzufügen
              </button>
            </div>
          </form>

          {/* Neue Kategorie anlegen (ausklappbar) */}
          {showAddCategory && (
            <form onSubmit={addCategory} className="pt-2 border-t flex gap-2">
              <input 
                type="text" 
                placeholder="Neue Kategorie..." 
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border rounded-xl outline-none focus:border-sage"
              />
              <button type="submit" className="bg-charcoal text-white text-xs px-3 py-1.5 rounded-xl">
                Erstellen
              </button>
            </form>
          )}
        </div>

        {/* Kategorien-Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          <button
            onClick={() => setActiveFilter('Alle')}
            className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap font-medium transition-colors ${
              activeFilter === 'Alle' ? 'bg-sage text-white' : 'bg-white text-muted border border-gray-100'
            }`}
          >
            Alle ({items.length})
          </button>
          {categories.map((cat) => {
            const count = items.filter(i => i.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap font-medium transition-colors flex items-center gap-1 ${
                  activeFilter === cat ? 'bg-sage text-white' : 'bg-white text-muted border border-gray-100'
                }`}
              >
                <span>{cat} ({count})</span>
                {categories.length > 1 && (
                  <span 
                    onClick={(e) => { e.stopPropagation(); deleteCategory(cat); }}
                    className="hover:text-red-500 ml-1 font-bold"
                  >
                    ×
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Aktionsleiste */}
        <div className="flex justify-between items-center mb-4 text-xs">
          <div className="flex gap-2">
            <button onClick={() => toggleAll(true)} className="text-sage font-medium">Alle abhaken</button>
            <span className="text-gray-300">|</span>
            <button onClick={() => toggleAll(false)} className="text-muted">Alle öffnen</button>
          </div>
          <button onClick={shareWhatsApp} className="text-sage font-medium">
            📲 via WhatsApp
          </button>
        </div>

        {/* Packliste */}
        <div className="space-y-2 mb-8">
          {filteredItems.length === 0 && (
            <p className="text-center text-sm text-muted py-8">Keine Einträge in dieser Kategorie.</p>
          )}

          {filteredItems.map((item) => (
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

        {/* Liste zurücksetzen */}
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