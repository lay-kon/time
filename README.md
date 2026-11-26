# Time

# Que horas são? Hora em inglês

Página interactiva para aprender a dizer as horas em inglês, feita para falantes de português.
Funciona só com HTML, CSS e JavaScript, sem instalar nada: abre o `index.html` no navegador.

## Objectivo

Dizer as horas em inglês complica muita gente. Este projecto explica a regra de forma simples e
deixa o aluno praticar com um relógio interactivo e um teste.

## A regra em resumo

| Minutos | Como se diz | Exemplo (3:xx) |
|---|---|---|
| 0 | o'clock | three o'clock |
| 1 a 29 | minutos + **past** + hora actual | twenty past three |
| 15 | quarter past | quarter past three |
| 30 | half past | half past three |
| 31 a 59 | minutos que faltam + **to** + hora seguinte | twenty to four |
| 45 | quarter to | quarter to four |

**Passou ou falta?** Até ao 30, usa-se *past*: é o que já passou. Depois do 30, a contagem é
decrescente (de 29 até 0) e usa-se *to*: é o que falta para a hora seguinte.

## Funcionalidades

- **Aprender:** explicação do conceito, vocabulário essencial e exemplos.
- **Praticar:** relógio onde arrastas os minutos e a hora. A hora digital, a frase em inglês, a
  versão em português e a explicação mudam em tempo real. Tem também um botão para ouvir a frase.
- **Truques:** cola rápida com o *past* e o *to* lado a lado, e erros comuns a evitar.
- **Teste:** 10 perguntas aleatórias, sem repetir horas nem minutos, com três tipos (ver o relógio,
  ler a frase, ouvir a frase) e explicação depois de cada resposta.

## Tecnologias

- HTML, CSS e JavaScript (sem bibliotecas)
- SVG para o relógio
- Web Speech API para a pronúncia

## Estrutura do código

- `index.html`: conteúdo e estrutura das quatro abas.
- `styles_css/style.css`: temas, componentes visuais e regras responsivas.
- `script_js/main.js`: ponto de entrada que inicia cada funcionalidade.
- `script_js/time-language.js`: conversões e explicações das horas.
- `script_js/clock.js`: desenho do relógio e interação por arrasto.
- `script_js/practice.js`: controlos e apresentação da hora na aba Praticar.
- `script_js/lesson.js`: exemplos e cartões gerados para a lição e os Truques.
- `script_js/quiz.js`: perguntas, respostas e pontuação do teste.
- `script_js/speech.js`: leitura de frases através de vozes locais do navegador.
- `script_js/tabs.js`: navegação entre as abas.
- `service-worker.js`: cache local da página, estilos e módulos para uso offline.

## Utilização offline

O site precisa ser aberto primeiro com internet, num endereço HTTPS como o GitHub Pages. Aguarda a mensagem **“Modo offline pronto neste dispositivo”**; depois disso, a página, o relógio, a lição, o teste e a pontuação ficam guardados neste navegador e podem ser usados sem ligação. O teste é gerado localmente e não envia respostas para nenhum servidor. O projeto não carrega fontes, bibliotecas ou imagens da internet. A leitura por voz só usa vozes instaladas localmente; se o dispositivo não tiver uma voz inglesa, o teste mostra a frase para poderes responder na mesma.

O cache offline é ativado por um service worker, por isso abrir o ficheiro `index.html` diretamente no computador não prepara o modo offline. Para testar localmente, usa um servidor de desenvolvimento em `localhost`.

## Como usar

1. Descarrega ou clona o repositório.
2. Abre o `index.html` no navegador.

## Autor

Abdoulayé Konaté, estudante de Informática no ITEL.
