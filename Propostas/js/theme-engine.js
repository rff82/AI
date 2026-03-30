/* ═══════════════════════════════════════════════════════════════════════════
   FARPA.AI - Theme Engine v5.0
   Gerenciador de temas com suporte a preferência do sistema
   ═══════════════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  const STORAGE_KEY = 'farpa-theme';
  const DEFAULT_THEME = 'claro';
  const THEMES = ['claro', 'escuro', 'sepia', 'alto-contraste', 'trader'];

  // ─────────────────────────────────────────────────────────────────────────
  // Aplica tema imediatamente (antes do DOMContentLoaded para evitar FOUC)
  // ─────────────────────────────────────────────────────────────────────────
  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'escuro';
    }
    return 'claro';
  }

  function applyTheme(theme) {
    if (!THEMES.includes(theme)) {
      theme = DEFAULT_THEME;
    }
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const colors = {
        'claro': '#ffffff',
        'escuro': '#0f172a',
        'sepia': '#faf7f2',
        'alto-contraste': '#000000',
        'trader': '#0a0e17'
      };
      metaThemeColor.content = colors[theme] || colors.claro;
    }
  }

  // Aplicação inicial (síncrona, antes do render)
  const stored = getStoredTheme();
  const initial = stored || getSystemPreference();
  applyTheme(initial);

  // ─────────────────────────────────────────────────────────────────────────
  // API Pública
  // ─────────────────────────────────────────────────────────────────────────
  window.farpaTheme = {
    /**
     * Retorna o tema atual
     * @returns {string}
     */
    get: function() {
      return document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
    },

    /**
     * Define um tema
     * @param {string} theme - Nome do tema
     * @returns {boolean} - Sucesso
     */
    set: function(theme) {
      if (!THEMES.includes(theme)) {
        console.warn(`[farpaTheme] Tema inválido: ${theme}. Temas disponíveis: ${THEMES.join(', ')}`);
        return false;
      }
      
      applyTheme(theme);
      
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (e) {
        console.warn('[farpaTheme] Não foi possível salvar preferência');
      }
      
      // Dispara evento customizado
      window.dispatchEvent(new CustomEvent('farpa:themechange', { 
        detail: { theme } 
      }));
      
      return true;
    },

    /**
     * Alterna entre dois temas (ou entre claro/escuro por padrão)
     * @param {string} [theme1='claro']
     * @param {string} [theme2='escuro']
     * @returns {string} - Novo tema
     */
    toggle: function(theme1 = 'claro', theme2 = 'escuro') {
      const current = this.get();
      const next = current === theme1 ? theme2 : theme1;
      this.set(next);
      return next;
    },

    /**
     * Lista todos os temas disponíveis
     * @returns {string[]}
     */
    list: function() {
      return [...THEMES];
    },

    /**
     * Reseta para preferência do sistema
     */
    reset: function() {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
      applyTheme(getSystemPreference());
    },

    /**
     * Verifica se é tema escuro
     * @returns {boolean}
     */
    isDark: function() {
      const theme = this.get();
      return ['escuro', 'alto-contraste', 'trader'].includes(theme);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Listener para mudança de preferência do sistema
  // ─────────────────────────────────────────────────────────────────────────
  if (window.matchMedia) {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    darkModeQuery.addEventListener('change', function(e) {
      // Só muda automaticamente se não houver preferência salva
      if (!getStoredTheme()) {
        applyTheme(e.matches ? 'escuro' : 'claro');
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Auto-inicialização de seletores de tema
  // ─────────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    // Selects com data-theme-select
    document.querySelectorAll('[data-theme-select]').forEach(function(select) {
      select.value = window.farpaTheme.get();
      select.addEventListener('change', function(e) {
        window.farpaTheme.set(e.target.value);
      });
    });

    // Botões com data-theme-toggle
    document.querySelectorAll('[data-theme-toggle]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const themes = btn.getAttribute('data-theme-toggle').split(',');
        if (themes.length === 2) {
          window.farpaTheme.toggle(themes[0].trim(), themes[1].trim());
        } else {
          window.farpaTheme.toggle();
        }
      });
    });

    // Botões com data-theme-set
    document.querySelectorAll('[data-theme-set]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        window.farpaTheme.set(btn.getAttribute('data-theme-set'));
      });
    });

    // Atualiza estado visual dos seletores quando tema muda
    window.addEventListener('farpa:themechange', function(e) {
      document.querySelectorAll('[data-theme-select]').forEach(function(select) {
        select.value = e.detail.theme;
      });
    });
  });

})();
