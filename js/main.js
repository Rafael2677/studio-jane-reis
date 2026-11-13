/* Studio Jane Reis — prévia Patron */
(function () {
  'use strict';

  var WHATS = 'https://wa.me/5511951218500';
  var MSG_PADRAO = 'Olá! Vim pelo site do Studio Jane Reis e gostaria de agendar um horário.';

  function link(msg) { return WHATS + '?text=' + encodeURIComponent(msg); }
  function $(sel, raiz) { return (raiz || document).querySelector(sel); }
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); }

  /* Links de WhatsApp com mensagem pronta */
  $$('.js-wa').forEach(function (a) { a.href = link(a.dataset.msg || MSG_PADRAO); });

  /* Topo ganha linha ao rolar */
  var topo = $('#topo');
  function aoRolar() { topo.classList.toggle('rolou', window.scrollY > 12); }
  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();

  /* Entrada das seções */
  var alvos = $$('.revelar');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visivel'); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    alvos.forEach(function (el) { obs.observe(el); });
  } else {
    alvos.forEach(function (el) { el.classList.add('visivel'); });
  }

  /* ---------- Montador do dia de beleza ---------- */
  var estado = { servicos: [], dia: '', periodo: '', nome: '' };
  var lista = $('#resumo-lista');
  var quando = $('#resumo-quando');
  var enviar = $('#btn-enviar');
  var flut = $('#flutuante');
  var flutTxt = $('#flutuante-txt');
  var flutConta = $('#flutuante-conta');
  var campoNome = $('#campo-nome');

  function textoQuando() {
    if (estado.dia && estado.periodo) return estado.dia + ', ' + estado.periodo;
    return estado.dia || estado.periodo || '';
  }

  function mensagem() {
    var linhas = ['Olá! Vim pelo site do Studio Jane Reis e quero montar meu dia de beleza:'];
    estado.servicos.forEach(function (s) { linhas.push('• ' + s.nome + ' (' + s.grupo + ')'); });
    var q = textoQuando();
    if (q) linhas.push('Preferência: ' + q + '.');
    if (estado.nome) linhas.push('Meu nome: ' + estado.nome);
    linhas.push('Pode me passar os horários disponíveis e os valores?');
    return linhas.join('\n');
  }

  function desenhar(novo) {
    var n = estado.servicos.length;

    lista.innerHTML = '';
    if (!n) {
      var vazio = document.createElement('li');
      vazio.className = 'resumo__vazio';
      vazio.textContent = 'Toque nos serviços e eles aparecem aqui.';
      lista.appendChild(vazio);
    }
    estado.servicos.forEach(function (s) {
      var li = document.createElement('li');
      if (s.nome === novo) li.className = 'entra';
      li.appendChild(document.createTextNode(s.nome));
      var g = document.createElement('span');
      g.textContent = s.grupo;
      li.appendChild(g);
      lista.appendChild(li);
    });

    var q = textoQuando();
    quando.hidden = !q;
    quando.textContent = q ? 'Preferência: ' + q : '';

    $$('.grupo').forEach(function (g) {
      g.classList.toggle('tem', !!$('.chip[aria-pressed="true"]', g));
    });

    if (n) {
      var url = link(mensagem());
      enviar.href = url;
      enviar.setAttribute('aria-disabled', 'false');
      enviar.textContent = 'Enviar pelo WhatsApp (' + n + ')';
      flut.href = url;
      flutTxt.textContent = 'Enviar meu dia';
      flutConta.hidden = false;
      flutConta.textContent = n;
      flut.setAttribute('aria-label', 'Enviar meu dia de beleza pelo WhatsApp, ' + n + (n === 1 ? ' serviço' : ' serviços'));
    } else {
      enviar.href = WHATS;
      enviar.setAttribute('aria-disabled', 'true');
      enviar.textContent = 'Escolha ao menos um serviço';
      flut.href = link(MSG_PADRAO);
      flutTxt.textContent = 'WhatsApp';
      flutConta.hidden = true;
      flut.setAttribute('aria-label', 'Chamar o Studio Jane Reis no WhatsApp');
    }
  }

  $$('.chip[data-servico]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var nome = chip.dataset.servico;
      var grupo = chip.closest('.grupo').dataset.grupo;
      var ligado = chip.getAttribute('aria-pressed') === 'true';
      chip.setAttribute('aria-pressed', String(!ligado));
      if (ligado) {
        estado.servicos = estado.servicos.filter(function (s) { return s.nome !== nome; });
      } else {
        estado.servicos.push({ nome: nome, grupo: grupo });
        flut.classList.remove('pulso');
        void flut.offsetWidth;
        flut.classList.add('pulso');
      }
      desenhar(ligado ? '' : nome);
    });
  });

  function opcoes(seletor, chave, atributo) {
    var botoes = $$(seletor);
    botoes.forEach(function (b) {
      b.addEventListener('click', function () {
        var jaEra = b.getAttribute('aria-checked') === 'true';
        botoes.forEach(function (o) { o.setAttribute('aria-checked', 'false'); });
        b.setAttribute('aria-checked', String(!jaEra));
        estado[chave] = jaEra ? '' : b.dataset[atributo];
        desenhar('');
      });
    });
  }
  opcoes('.chip[data-dia]', 'dia', 'dia');
  opcoes('.chip[data-periodo]', 'periodo', 'periodo');

  campoNome.addEventListener('input', function () {
    estado.nome = campoNome.value.trim();
    desenhar('');
  });

  enviar.addEventListener('click', function (e) {
    if (enviar.getAttribute('aria-disabled') === 'true') {
      e.preventDefault();
      var primeiro = $('.chip[data-servico]');
      if (primeiro) primeiro.focus();
    }
  });

  desenhar('');
})();
