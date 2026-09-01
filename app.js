const { useState } = React;

function ListItem({ title }) {
  const [isChecked, setIsChecked] = useState(false);

  const handleToggle = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    setIsChecked(!isChecked);
  };

  return (
    <div
      onClick={handleToggle}
      className={`flex items-center justify-between p-4 mb-3 rounded-2xl bg-white border border-gray-100 transition-all duration-300 cursor-pointer shadow-sm ${
        isChecked ? 'opacity-50 line-through bg-gray-50' : 'text-charcoal'
      }`}
    >
      <span className="text-base font-medium">{title}</span>
      <div
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-transform active:scale-110 ${
          isChecked
            ? 'bg-sage border-sage text-white'
            : 'border-sand bg-transparent'
        }`}
      >
        {isChecked && <span className="text-xs font-bold">✓</span>}
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="p-6 max-w-sm mx-auto min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-charcoal">Pack-App 🧳</h1>
      <ListItem title="Reisepass & Dokumente" />
      <ListItem title="Ladekabel & Powerbank" />
      <ListItem title="Kulturtasche" />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));