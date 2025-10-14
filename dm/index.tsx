import React, { useState, useEffect } from 'react';
import { Menu, X, Plus, Edit2, Trash2, GripVertical, Download, Save, Moon, Sun, Sparkles } from 'lucide-react';

const DynamicMenuApp = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('dynamicMenu');
    if (saved) {
      try {
        setMenuItems(JSON.parse(saved));
      } catch (e) {
        initializeSampleData();
      }
    } else {
      initializeSampleData();
    }
  }, []);

  const initializeSampleData = () => {
    setMenuItems([
      { id: 1, title: 'Home Page', url: 'https://example.com', icon: 'home' },
      { id: 2, title: 'About Us', url: 'https://example.com/about', icon: 'info' },
      { id: 3, title: 'Services', url: 'https://example.com/services', icon: 'briefcase' },
      { id: 4, title: 'Contact', url: 'https://example.com/contact', icon: 'mail' }
    ]);
  };

  useEffect(() => {
    if (menuItems.length > 0) {
      sessionStorage.setItem('dynamicMenu', JSON.stringify(menuItems));
    }
  }, [menuItems]);

  const iconMap = {
    home: '🏠', info: 'ℹ️', briefcase: '💼', mail: '✉️', 
    star: '⭐', heart: '❤️', settings: '⚙️', user: '👤',
    globe: '🌐', phone: '📞', calendar: '📅', book: '📚'
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = () => {
    sessionStorage.setItem('dynamicMenu', JSON.stringify(menuItems));
    showNotification('✅ Changes saved successfully!');
    triggerConfetti();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(menuItems, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', 'dynamic-menu-export.json');
    link.click();
    showNotification('📥 Menu exported successfully!');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all menu items? This cannot be undone.')) {
      setMenuItems([]);
      sessionStorage.removeItem('dynamicMenu');
      showNotification('🗑️ All items cleared');
    }
  };

  const handleSubmitItem = (formData) => {
    if (editingItem) {
      setMenuItems(prev => prev.map(item => 
        item.id === editingItem.id ? { ...item, ...formData } : item
      ));
      showNotification('✏️ Item updated!');
    } else {
      const newItem = { ...formData, id: Date.now() };
      setMenuItems(prev => [...prev, newItem]);
      showNotification('➕ Item added!');
    }
    triggerConfetti();
    setShowModal(false);
    setEditingItem(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this menu item?')) {
      setMenuItems(prev => prev.filter(item => item.id !== id));
      showNotification('🗑️ Item deleted');
    }
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.currentTarget.style.opacity = '0.4';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) return;

    const items = [...menuItems];
    const draggedIdx = items.findIndex(i => i.id === draggedItem.id);
    const targetIdx = items.findIndex(i => i.id === targetItem.id);
    
    items.splice(draggedIdx, 1);
    items.splice(targetIdx, 0, draggedItem);
    
    setMenuItems(items);
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1000);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} transition-colors duration-500`}>
      <header className={`fixed top-0 left-0 right-0 z-50 ${isDarkMode ? 'bg-white/10' : 'bg-white/70'} backdrop-blur-xl border-b ${isDarkMode ? 'border-purple-500/30' : 'border-purple-300/50'} shadow-lg`}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10">
              <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
                <defs>
                  <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#06b6d4', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#a855f7', stopOpacity: 1}} />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="45" fill="none" stroke="url(#logoGrad)" strokeWidth="3"/>
                <text x="50" y="60" textAnchor="middle" fill="url(#logoGrad)" fontSize="40" fontWeight="bold" fontFamily="serif">DM</text>
              </svg>
              {showConfetti && <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400 animate-ping" />}
            </div>
          </div>

          <h1 className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tight`}>
            Dynamic Menu
          </h1>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-white/20' : 'hover:bg-black/10'} transition-all duration-300`}
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? 
              <X className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-slate-800'} transform rotate-90 transition-transform duration-300`} /> :
              <Menu className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`} />
            }
          </button>
        </div>
      </header>

      {isEditMode && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-center py-2 text-sm font-semibold animate-pulse">
          ✨ Edit Mode Active – Drag to Rearrange
        </div>
      )}

      <main className={`pt-20 ${isEditMode ? 'pt-28' : 'pt-20'} pb-8 px-4`}>
        <div className="max-w-6xl mx-auto">
          {menuItems.length === 0 ? (
            <div className={`text-center py-20 ${isDarkMode ? 'text-white/60' : 'text-slate-600'}`}>
              <p className="text-lg mb-4">No menu items yet!</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-semibold hover:scale-105 transition-transform"
              >
                Add Your First Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  draggable={isEditMode}
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, item)}
                  className={`group relative ${isDarkMode ? 'bg-white/10' : 'bg-white'} backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer ${isEditMode ? 'cursor-move' : ''}`}
                  onClick={() => !isEditMode && window.open(item.url, '_blank')}
                >
                  {isEditMode && (
                    <div className="absolute top-2 left-2">
                      <GripVertical className={`w-5 h-5 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`} />
                    </div>
                  )}

                  <div className="text-5xl mb-4 text-center filter drop-shadow-lg">
                    {iconMap[item.icon] || '📄'}
                  </div>

                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-2 text-center truncate`}>
                    {item.title}
                  </h3>

                  <p className={`text-xs ${isDarkMode ? 'text-cyan-300' : 'text-purple-600'} truncate text-center mb-4`}>
                    {item.url}
                  </p>

                  {isEditMode && (
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItem(item);
                          setShowModal(true);
                        }}
                        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        aria-label="Edit item"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        aria-label="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <div
        className={`fixed top-0 right-0 h-full w-80 ${isDarkMode ? 'bg-slate-900/95' : 'bg-white/95'} backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-out z-50 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Menu</h2>
            <button onClick={() => setIsSidebarOpen(false)} className={`p-2 ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'} rounded-lg`}>
              <X className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`} />
            </button>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-full flex items-center justify-between p-4 ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'} rounded-xl transition-colors`}
            >
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Dark Mode</span>
              {isDarkMode ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-yellow-500" />}
            </button>

            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`w-full flex items-center justify-between p-4 ${isEditMode ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'} rounded-xl transition-all`}
            >
              <span className={`font-semibold ${isDarkMode || isEditMode ? 'text-white' : 'text-slate-800'}`}>Edit Mode</span>
              <Edit2 className={`w-5 h-5 ${isEditMode ? 'text-white' : isDarkMode ? 'text-cyan-400' : 'text-purple-600'}`} />
            </button>

            <button
              onClick={() => {
                setEditingItem(null);
                setShowModal(true);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between p-4 ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'} rounded-xl transition-colors`}
            >
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Add New Item</span>
              <Plus className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            </button>

            <button
              onClick={handleSave}
              className={`w-full flex items-center justify-between p-4 ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'} rounded-xl transition-colors`}
            >
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Save Changes</span>
              <Save className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </button>

            <button
              onClick={handleExport}
              className={`w-full flex items-center justify-between p-4 ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'} rounded-xl transition-colors`}
            >
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Export Menu</span>
              <Download className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </button>

            <button
              onClick={handleClearAll}
              className={`w-full flex items-center justify-between p-4 ${isDarkMode ? 'bg-red-500/20 hover:bg-red-500/30' : 'bg-red-100 hover:bg-red-200'} rounded-xl transition-colors`}
            >
              <span className={`font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>Clear All</span>
              <Trash2 className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <ItemModal
          item={editingItem}
          isDarkMode={isDarkMode}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
          onSubmit={handleSubmitItem}
          iconMap={iconMap}
        />
      )}

      {notification && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded-full shadow-2xl animate-bounce z-50">
          {notification}
        </div>
      )}

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        />
      )}

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

const ItemModal = ({ item, isDarkMode, onClose, onSubmit, iconMap }) => {
  const [title, setTitle] = useState(item?.title || '');
  const [url, setUrl] = useState(item?.url || '');
  const [icon, setIcon] = useState(item?.icon || 'home');

  const handleSubmit = () => {
    if (!title || !url) {
      alert('Please fill in all fields');
      return;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      alert('URL must start with http:// or https://');
      return;
    }
    onSubmit({ title, url, icon });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-md w-full p-6 transform scale-100 animate-scale-in`}>
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-6`}>
          {item ? 'Edit Item' : 'Add New Item'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-700'} mb-2`}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-3 ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-800'} rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="e.g., Home Page"
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-700'} mb-2`}>
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={`w-full px-4 py-3 ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-800'} rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-700'} mb-2`}>
              Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {Object.keys(iconMap).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIcon(key)}
                  className={`p-3 text-2xl rounded-xl transition-all ${icon === key ? 'bg-gradient-to-br from-cyan-500 to-purple-500 scale-110' : isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
                >
                  {iconMap[key]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-6 py-3 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} ${isDarkMode ? 'text-white' : 'text-slate-800'} rounded-xl font-semibold transition-colors`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-semibold hover:scale-105 transition-transform"
            >
              {item ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicMenuApp;