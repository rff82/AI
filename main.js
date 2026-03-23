(function () {
  'use strict';

  const layout = document.getElementById('farpa-layout');
  if (layout && window.farpaTopnav) {
    const existingTopnav = document.getElementById('farpa-topnav');
    if (!existingTopnav) {
      const topnav = window.farpaTopnav.build('home', [{ label: 'Início' }]);
      layout.insertBefore(topnav, layout.firstChild);
    }
  }

  const waitlistForm = document.getElementById('waitlist-form');
  if (waitlistForm) {
    waitlistForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const input = waitlistForm.querySelector('input[type="email"]');
      const button = waitlistForm.querySelector('button[type="submit"]');
      const email = input.value.trim();

      if (!email || !email.includes('@')) {
        input.focus();
        return;
      }

      const originalText = button.textContent;
      button.disabled = true;
      button.textContent = 'Enviando...';

      try {
        const response = await fetch('https://api-leads.rfelipefernandes.workers.dev/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Lead Lista de Acesso',
            email,
            interest: 'Lista de acesso Farpa'
          })
        });

        if (!response.ok) {
          throw new Error('Falha ao enviar cadastro.');
        }

        input.value = '';
        input.placeholder = 'Cadastro confirmado.';
        button.textContent = 'Você entrou na lista';
      } catch (error) {
        console.error(error);
        button.textContent = 'Erro ao enviar';
        window.setTimeout(function () {
          button.textContent = originalText;
          button.disabled = false;
        }, 2400);
        return;
      }

      window.setTimeout(function () {
        button.textContent = originalText;
        button.disabled = false;
      }, 2600);
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
