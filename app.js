const { useState, useEffect } = React;

function App() {
  // 1. Nutzersystem & Profilauswahl
  const [userList, setUserList] = useState(() => {
    const saved = localStorage.getItem('packapp_user_list');
    return saved ? JSON.parse(saved) : ['Christian', 'Miriam'];
  });
  
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('packapp_current_user') || 'Christian';
  });

  const [newUserInput, setNewUserInput] = useState('');

  // 2. Datenstruktur pro Nutzer (Listen, Personen, Kategorien)
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('packapp_all_data');
    return saved ? JSON.parse(saved) : {};
  });

  // Aktuelle Daten des eingeloggten Nutzers herausgreifen (oder Standardwerte)
  const currentUserData = userData[currentUser] || {
    items: [
      { id: 1, text: 'Reisepass', category: 'Dokumente', person: 'Alle', checked: false },
      { id: 2, text: 'Lieblingskuscheltier', category: 'Spielzeug', person: 'Kind 1', checked: false }
    ],
    categories: ['Allgemein', 'Kleidung', 'Elektronik', 'Dokumente', 'Spielzeug'],
    people: ['Alle', 'Vater', 'Mutter', 'Kind 1', 'Kind 2']
  };

  const items = currentUserData.items;
  const categories = currentUserData.categories;
  const people = currentUserData.people;

  // Formular-States
  const [newItemText, setNewItemText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || 'Allgemein');
  const [selectedPerson, setSelectedPerson] = useState(people[0] || 'Alle');
  
  const [newCatInput, setNewCatInput] = useState('');
  const [newPersonInput, setNewPersonInput] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);
  const [showAddPerson, setShowAddPerson] = useState(false);

  // Filter-States
  const [activeCatFilter, setActiveCatFilter] = useState('Alle');
  const [activePersonFilter, setActivePersonFilter] = useState('Alle');

  // Persistence im LocalStorage
  useEffect(() => {
    localStorage.setItem('packapp_user_list', JSON.stringify(userList));
  }, [userList]);

  useEffect(() => {
    localStorage.setItem('packapp_current_user', currentUser);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('packapp_all_data', JSON.stringify(userData));
  }, [userData]);

  // Hilfsfunktion: Daten des aktuellen Nutzers im Haupt-State aktualisieren
  const updateCurrentUserData = (updatedFields) => {
    setUserData(prev => ({
      ...prev,
      [currentUser]: {
        ...currentUserData,
        ...updatedFields
      }
    }));
  };

  // Nutzer anlegen / wechseln
  const handleAddUser = (e) => {
    e.preventDefault();
    const name = newUserInput.trim();
    if (name && !userList.includes(name)) {
      setUserList([...userList, name]);
      setCurrentUser(name);
      setNewUserInput('');
    }
  };

  // Person anlegen
  const handleAddPerson = (e) => {
    e.preventDefault();
    const pName = newPersonInput.trim();
    if (pName && !people.includes(pName)) {
      updateCurrentUserData({ people: [...people, pName] });
      setSelectedPerson(pName);
      setNewPersonInput('');
      setShowAddPerson(false);
    }
  };

  // Kategorie anlegen
  const handleAddCategory = (e) => {
    e.preventDefault();
    const cName = newCatInput.trim();
    if (cName && !categories.includes(cName)) {
      updateCurrentUserData({ categories: [...categories, cName] });
      setSelectedCategory(cName);
      setNewCatInput('');
      setShowAddCat(false);
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
      person: selectedPerson,
      checked: false
    };
    updateCurrentUserData({ items: [...items, newItem] });
    setNewItemText('');
  };

  // Item abhaken
  const toggleItem = (id) => {
    if (navigator.vibrate) navigator.vibrate(10);
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    updateCurrentUserData({ items: updatedItems });
  };

  // Item löschen
  const deleteItem = (id) => {
    updateCurrentUserData({ items: items.filter(item => item.id !== id) });
  };

  // Alle abhaken / öffnen
  const toggleAll = (status) => {
    updateCurrentUserData({ items: items.map(i => ({ ...i, checked: status })) });
  };

  // Liste leeren
  const resetList = () => {
    if (confirm(`Alle Einträge für Nutzer "${currentUser}" wirklich löschen?`)) {
      updateCurrentUserData({ items: [] });
    }
  };

  // WhatsApp-Share
  const shareWhatsApp = () => {
    const openItems = items
      .filter(i => !i.checked)
      .map(i => `• ${i.text} (${i.person} / ${i.category})`)
      .join('\n');
    const text = `*Packliste von ${currentUser}*\n\n*Offen:*\n${openItems || 'Alles gepackt! 🎉'}\n\nErstellt mit der Pack-App 🧳`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Filter-Logik & Fortschritt
  const filteredItems = items.filter(item => {
    const catMatch = activeCatFilter === 'Alle' || item.category === activeCatFilter;
    const personMatch = activePersonFilter === 'Alle' || item.person === activePersonFilter;
    return catMatch && personMatch;
  });

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
        
        {/* Header & Nutzer-Dropdown */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-xl font-bold">Pack-App 🧳</h1>
            <span className="text-xs bg-sage/10 text-sage font-semibold px-2.5 py-1 rounded-full">
              {progressPercent}% gepackt
            </span>
          </div>

          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <label className="block text-[10px] text-muted font-bold uppercase mb-1">Aktiver Nutzer:</label>
              <select 
                value={currentUser}
                onChange={(e) => setCurrentUser(e.target.value)}
                className="w-full text-xs font-semibold bg-gray-50 border rounded-xl px-3 py-2 outline-none focus:border-sage"
              >
                {userList.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-[10px] text-muted font-bold uppercase mb-1">+ Neuer Nutzer:</label>
              <form onSubmit={handleAddUser} className="flex gap-1">
                <input 
                  type="text" 
                  placeholder="Name"
                  value={newUserInput}
                  onChange={(e) => setNewUserInput(e.target.value)}
                  className="w-full text-xs px-2 py-1.5 border rounded-xl outline-none"
                />
                <button type="submit" className="bg-sage text-white text-xs px-3 py-1.5 rounded-xl font-bold">+</button>
              </form>
            </div>
          </div>
        </div>

        {/* Neues Item anlegen */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 space-y-3">
          <form onSubmit={addItem} className="space-y-3">
            <input 
              type="text" 
              placeholder="Gegenstand eintragen..." 
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-xl outline-none focus:border-sage"
            />

            {/* Zuordnung: Person & Kategorie */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] text-muted font-bold uppercase">Person:</label>
                  <button type="button" onClick={() => setShowAddPerson(!showAddPerson)} className="text-[10px] text-sage font-bold">+ Person</button>
                </div>
                <select 
                  value={selectedPerson}
                  onChange={(e) => setSelectedPerson(e.target.value)}
                  className="w-full text-xs bg-gray-50 border rounded-xl px-2 py-2 outline-none"
                >
                  {people.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] text-muted font-bold uppercase">Kategorie:</label>
                  <button type="button" onClick={() => setShowAddCat(!showAddCat)} className="text-[10px] text-sage font-bold">+ Kat.</button>
                </div>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-xs bg-gray-50 border rounded-xl px-2 py-2 outline-none"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" className="w-full bg-sage text-white text-sm font-medium py-2.5 rounded-xl active:scale-95 transition-transform">
              + Item hinzufügen
            </button>
          </form>

          {/* Neue Person hinzufügen */}
          {showAddPerson && (
            <form onSubmit={handleAddPerson} className="pt-2 border-t flex gap-2">
              <input 
                type="text" 
                placeholder="Name der Person (z.B. Noah)" 
                value={newPersonInput}
                onChange={(e) => setNewPersonInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border rounded-xl outline-none"
              />
              <button type="submit" className="bg-charcoal text-white text-xs px-3 py-1.5 rounded-xl">Speichern</button>
            </form>
          )}

          {/* Neue Kategorie hinzufügen */}
          {showAddCat && (
            <form onSubmit={handleAddCategory} className="pt-2 border-t flex gap-2">
              <input 
                type="text" 
                placeholder="Neue Kategorie (z.B. Sport)" 
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border rounded-xl outline-none"
              />
              <button type="submit" className="bg-charcoal text-white text-xs px-3 py-1.5 rounded-xl">Speichern</button>
            </form>
          )}
        </div>

        {/* Filter-Leisten */}
        <div className="space-y-2 mb-4">
          {/* Personen-Filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] text-muted font-bold uppercase self-center mr-1">Person:</span>
            {people.map(p => (
              <button
                key={p}
                onClick={() => setActivePersonFilter(p)}
                className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-colors ${
                  activePersonFilter === p ? 'bg-charcoal text-white' : 'bg-white text-muted border'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Kategorien-Filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] text-muted font-bold uppercase self-center mr-1">Kat:</span>
            <button
              onClick={() => setActiveCatFilter('Alle')}
              className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-colors ${
                activeCatFilter === 'Alle' ? 'bg-sage text-white' : 'bg-white text-muted border'
              }`}
            >
              Alle
            </button>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setActiveCatFilter(c)}
                className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-colors ${
                  activeCatFilter === c ? 'bg-sage text-white' : 'bg-white text-muted border'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Aktionen */}
        <div className="flex justify-between items-center mb-3 text-xs">
          <div className="flex gap-2">
            <button onClick={() => toggleAll(true)} className="text-sage font-medium">Alle abhaken</button>
            <span className="text-gray-300">|</span>
            <button onClick={() => toggleAll(false)} className="text-muted">Alle öffnen</button>
          </div>
          <button onClick={shareWhatsApp} className="text-sage font-medium">📲 via WhatsApp</button>
        </div>

        {/* Die Liste */}
        <div className="space-y-2 mb-8">
          {filteredItems.length === 0 && (
            <p className="text-center text-sm text-muted py-8 bg-white rounded-2xl border">Keine Einträge für diese Auswahl.</p>
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
                  <div className="flex gap-1 mt-0.5">
                    <span className="text-[9px] bg-gray-100 text-charcoal px-2 py-0.5 rounded-md font-semibold">{item.person}</span>
                    <span className="text-[9px] bg-sage/10 text-sage px-2 py-0.5 rounded-md font-semibold">{item.category}</span>
                  </div>
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

        {/* Reset */}
        {items.length > 0 && (
          <div className="text-center">
            <button onClick={resetList} className="text-xs text-red-400 hover:text-red-600 transition-colors">
              Liste von {currentUser} leeren
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));