import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Trash2,
  Plus,
  Calendar as CalendarIcon,
  Briefcase,
  User,
  BookOpen,
  Heart,
  DollarSign,
  Smile,
  Tag,
  Check,
  Filter,
  X,
  Clock,
  Sparkles,
  ListTodo
} from 'lucide-react';

const CATEGORIES = [
  { id: 'pessoal', name: 'Pessoal', color: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE', icon: User },
  { id: 'trabalho', name: 'Trabalho', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', icon: Briefcase },
  { id: 'estudos', name: 'Estudos', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', icon: BookOpen },
  { id: 'saude', name: 'Saúde', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', icon: Heart },
  { id: 'financas', name: 'Finanças', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: DollarSign },
  { id: 'lazer', name: 'Lazer', color: '#DB2777', bg: '#FDF2F8', border: '#FBCFE8', icon: Smile },
];

// Helper seguro para obter data local no formato YYYY-MM-DD
const getLocalDateString = (dateObj = new Date()) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayString = () => getLocalDateString(new Date());

const getTomorrowString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getLocalDateString(tomorrow);
};

const INITIAL_TASKS = [
  {
    id: '1',
    title: 'Reunião de alinhamento com equipe',
    category: 'trabalho',
    date: getTodayString(),
    completed: false,
    time: '09:00'
  },
  {
    id: '2',
    title: 'Treino de cardio na academia',
    category: 'saude',
    date: getTodayString(),
    completed: true,
    time: '07:00'
  },
  {
    id: '3',
    title: 'Estudar módulo de React e componentes',
    category: 'estudos',
    date: getTodayString(),
    completed: false,
    time: '19:30'
  },
  {
    id: '4',
    title: 'Comprar mantimentos para a semana',
    category: 'pessoal',
    date: getTomorrowString(),
    completed: false,
    time: '14:00'
  }
];

const LOCAL_STORAGE_KEY = 'tarefas_diarias_app_v2';

export default function App() {
  // Carrega as tarefas salvas do LocalStorage ou usa as tarefas iniciais de exemplo
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (error) {
      console.error('Erro ao ler do LocalStorage:', error);
    }
    return INITIAL_TASKS;
  });

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('todas');
  const [selectedDateFilter, setSelectedDateFilter] = useState('hoje'); // 'hoje', 'proximos', 'todas', 'custom'
  const [customDate, setCustomDate] = useState(getTodayString());
  
  // Modal State para Nova Tarefa
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('pessoal');
  const [newDate, setNewDate] = useState(getTodayString());
  const [newTime, setNewTime] = useState('12:00');

  const todayStr = getTodayString();

  // Persistência em LocalStorage a cada alteração
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Erro ao salvar no LocalStorage:', error);
    }
  }, [tasks]);

  const handleAddTask = (e) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      category: newCategory,
      date: newDate || todayStr,
      time: newTime || '12:00',
      completed: false,
    };

    setTasks(prevTasks => [newTask, ...prevTasks]);
    setNewTitle('');
    setNewDate(todayStr);
    setNewTime('12:00');
    setModalVisible(false);
  };

  const toggleTaskComplete = (id) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Filtro por Categoria
      if (selectedCategoryFilter !== 'todas' && task.category !== selectedCategoryFilter) {
        return false;
      }

      // Filtro por Data
      if (selectedDateFilter === 'hoje') {
        return task.date === todayStr;
      } else if (selectedDateFilter === 'proximos') {
        return task.date > todayStr;
      } else if (selectedDateFilter === 'custom') {
        return task.date === customDate;
      }

      return true; // 'todas'
    });
  }, [tasks, selectedCategoryFilter, selectedDateFilter, customDate, todayStr]);

  // Estatísticas do Dia
  const todayTasks = tasks.filter(t => t.date === todayStr);
  const completedTodayTasks = todayTasks.filter(t => t.completed);
  const completionPercentage = todayTasks.length > 0 
    ? Math.round((completedTodayTasks.length / todayTasks.length) * 100) 
    : 0;

  const getCategoryInfo = (catId) => {
    return CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    if (dateString === todayStr) return 'Hoje';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center p-0 sm:p-4 font-sans text-slate-800">
      {/* Mobile Shell / App Container */}
      <div className="w-full max-w-md bg-slate-50 min-h-screen sm:min-h-[840px] sm:max-h-[900px] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border border-slate-200">
        
        {/* Header */}
        <header className="px-5 pt-6 pb-4 bg-slate-50 flex items-center justify-between z-10">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Olá, Bem-vindo(a)! 👋</span>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">Minhas Tarefas</h1>
          </div>
          <button
            onClick={() => {
              setNewDate(getTodayString());
              setModalVisible(true);
            }}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-full shadow-lg shadow-indigo-200 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={18} />
            <span className="text-sm font-semibold">Nova</span>
          </button>
        </header>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-24 space-y-5 custom-scrollbar">
          
          {/* Progress Card */}
          <div className="bg-indigo-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-100 flex items-center justify-between relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-indigo-500/30 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex-1 pr-3 z-10">
              <h2 className="text-base font-bold text-white mb-0.5">Progresso de Hoje</h2>
              <p className="text-xs text-indigo-100 mb-3">
                {completedTodayTasks.length} de {todayTasks.length} tarefas concluídas
              </p>
              
              {/* Progress Bar */}
              <div className="w-full bg-indigo-900/40 h-2.5 rounded-full overflow-hidden p-0.5">
                <div 
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Percentage Circle Badge */}
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/40 border border-indigo-300/30 flex items-center justify-center font-bold text-lg text-white backdrop-blur-sm shrink-0 z-10">
              {completionPercentage}%
            </div>
          </div>

          {/* Filter Section: Date Period */}
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Período</span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedDateFilter('hoje')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer border ${
                  selectedDateFilter === 'hoje'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Clock size={14} />
                <span>Hoje</span>
              </button>

              <button
                onClick={() => setSelectedDateFilter('proximos')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer border ${
                  selectedDateFilter === 'proximos'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <CalendarIcon size={14} />
                <span>Próximos</span>
              </button>

              <button
                onClick={() => setSelectedDateFilter('todas')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer border ${
                  selectedDateFilter === 'todas'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ListTodo size={14} />
                <span>Todas</span>
              </button>

              <button
                onClick={() => setSelectedDateFilter('custom')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer border ${
                  selectedDateFilter === 'custom'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Filter size={14} />
                <span>{selectedDateFilter === 'custom' ? formatDateDisplay(customDate) : 'Data...'}</span>
              </button>
            </div>

            {/* Custom Date Picker Dropdown */}
            {selectedDateFilter === 'custom' && (
              <div className="mt-2.5 p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Escolher data:</span>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Filter Section: Categories */}
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Categoria</span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedCategoryFilter('todas')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer border ${
                  selectedCategoryFilter === 'todas'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Tag size={13} />
                <span>Todas</span>
              </button>

              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isSelected = selectedCategoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer border"
                    style={{
                      backgroundColor: isSelected ? cat.color : '#FFFFFF',
                      borderColor: isSelected ? cat.color : '#E2E8F0',
                      color: isSelected ? '#FFFFFF' : '#475569'
                    }}
                  >
                    <Icon size={13} style={{ color: isSelected ? '#FFFFFF' : cat.color }} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tarefas ({filteredTasks.length})
              </span>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200 flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-3">
                  <Sparkles size={24} />
                </div>
                <p className="text-slate-800 font-semibold text-sm">Nenhuma tarefa encontrada</p>
                <p className="text-slate-400 text-xs mt-1 max-w-[220px]">
                  Não há tarefas cadastradas para os filtros selecionados.
                </p>
              </div>
            ) : (
              filteredTasks.map(item => {
                const catInfo = getCategoryInfo(item.category);
                const CategoryIcon = catInfo.icon;

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl p-3.5 border transition-all flex items-start justify-between gap-3 shadow-sm hover:shadow ${
                      item.completed ? 'border-slate-100 bg-slate-50/80 opacity-75' : 'border-slate-200/80'
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTaskComplete(item.id)}
                      className="mt-0.5 text-slate-300 hover:text-emerald-500 transition-colors cursor-pointer shrink-0"
                    >
                      {item.completed ? (
                        <CheckCircle2 size={22} className="text-emerald-500 fill-emerald-50 stroke-emerald-600" />
                      ) : (
                        <Circle size={22} className="text-slate-300 hover:text-indigo-500" />
                      )}
                    </button>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold leading-snug break-words ${
                        item.completed ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}>
                        {item.title}
                      </p>

                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {/* Category Badge */}
                        <span 
                          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border"
                          style={{
                            backgroundColor: catInfo.bg,
                            color: catInfo.color,
                            borderColor: catInfo.border
                          }}
                        >
                          <CategoryIcon size={11} />
                          {catInfo.name}
                        </span>

                        {/* Date & Time Badge */}
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                          <Clock size={11} className="text-slate-400" />
                          {formatDateDisplay(item.date)} às {item.time}
                        </span>
                      </div>
                    </div>

                    {/* Delete Action Button */}
                    <button
                      onClick={() => deleteTask(item.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer shrink-0"
                      title="Excluir tarefa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal: New Task Form Drawer */}
        {modalVisible && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex flex-col justify-end animate-fadeIn">
            <div className="bg-white rounded-t-3xl p-6 shadow-2xl space-y-4 border-t border-slate-100 max-h-[90%] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Nova Tarefa</h3>
                <button
                  onClick={() => setModalVisible(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-4">
                {/* Title Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    O que precisa ser feito?
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pagar conta de luz, Estudo de inglês..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Category Choice */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Categoria
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map(cat => {
                      const Icon = cat.icon;
                      const isSelected = newCategory === cat.id;
                      return (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => setNewCategory(cat.id)}
                          className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'ring-2 ring-indigo-500 border-transparent shadow-xs'
                              : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                          }`}
                          style={{
                            backgroundColor: isSelected ? cat.bg : undefined,
                            color: isSelected ? cat.color : undefined,
                            borderColor: isSelected ? cat.border : undefined,
                          }}
                        >
                          <Icon size={14} />
                          <span>{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date & Time Input */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Data
                    </label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Horário
                    </label>
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Check size={18} />
                  <span>Salvar Tarefa</span>
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}