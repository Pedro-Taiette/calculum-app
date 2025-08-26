import React from "react";
import { InlineMath, BlockMath } from "react-katex";

/** Documentação educacional e técnica da Calculadora de Cálculo. */
export default function Docs() {
  return (
    <section className="card p-6 space-y-8">
      <Header />

      <Section title="1. Visão geral">
        <p>
          Esta aplicação calcula limites de funções reais de uma variável com entrada
          livre de expressões, pré-visualização matemática, classificação de limite
          lateral e bilateral, e gráfico interativo ao redor do ponto de interesse.
        </p>
        <ul className="list-disc ml-6">
          <li>
            <b>Motor matemático:</b> <i>SymPy</i> (via Pyodide/WASM) para o cálculo
            de limites laterais e combinação no bilateral.
          </li>
          <li>
            <b>Simplificação algébrica:</b> <i>Nerdamer</i> para reduzir a expressão
            de entrada a uma forma mais simples (ex.:{" "}
            <InlineMath math="(x^2-1)/(x-1)\ \to\ x+1" />).
          </li>
          <li>
            <b>Renderização LaTeX:</b> <i>math.js</i> gera o LaTeX das expressões
            originais e simplificadas; <i>KaTeX</i> renderiza.
          </li>
          <li>
            <b>UI/UX:</b> React + TypeScript + TailwindCSS, tema claro/escuro, teclado matemático.
          </li>
        </ul>
      </Section>

      <Section title="2. Como usar">
        <ol className="list-decimal ml-6 space-y-2">
          <li>
            Digite a expressão em <code>f(x)</code> ou use o teclado virtual. Exemplos:
            <code className="ml-2">(x^2-1)/(x-1)</code>, <code>sin(x)/x</code>,{" "}
            <code>(1-cos(x))/x</code>, <code>ln(x)</code>, <code>sqrt(x+2)</code>.
          </li>
          <li>
            Defina o ponto <InlineMath math="a" /> e escolha o tipo: bilateral{" "}
            <InlineMath math="\lim_{x\to a} f(x)" />, esquerda{" "}
            <InlineMath math="\lim_{x\to a^-} f(x)" /> ou direita{" "}
            <InlineMath math="\lim_{x\to a^+} f(x)" />.
          </li>
          <li>
            Veja a <b>forma simplificada</b> e o <b>resultado</b> do limite. O gráfico
            mostra o comportamento próximo de <InlineMath math="x=a" />.
          </li>
        </ol>
        <Details title="Sintaxe suportada (entrada)">
          <ul className="list-disc ml-6">
            <li>Variável padrão: <code>x</code>. Constantes: <code>pi</code>, <code>e</code>.</li>
            <li>Operadores: <code>+ - * / ^</code> e parênteses.</li>
            <li>Funções: <code>sin, cos, tan, log(x[, base]), ln, sqrt, abs</code>.</li>
            <li>Ex.: <code>log(x, e)</code> é o mesmo que <code>ln(x)</code>.</li>
          </ul>
        </Details>
      </Section>

      <Section title="3. Conceitos matemáticos essenciais">
        <Sub title="3.1 Definição informal de limite">
          <p>
            Dizemos que <InlineMath math="\lim_{x\to a} f(x)=L" /> se os valores de{" "}
            <InlineMath math="f(x)" /> se aproximam de <InlineMath math="L" /> quando{" "}
            <InlineMath math="x" /> se aproxima de <InlineMath math="a" />. A aplicação
            distingue ainda os limites laterais:
          </p>
          <ul className="list-disc ml-6">
            <li>
              Esquerda: <InlineMath math="\lim_{x\to a^-} f(x)" />, aproximando por{" "}
              <InlineMath math="x&lt;a" />.
            </li>
            <li>
              Direita: <InlineMath math="\lim_{x\to a^+} f(x)" />, aproximando por{" "}
              <InlineMath math="x&gt;a" />.
            </li>
            <li>
              O limite bilateral existe se e somente se os dois laterais existem e são iguais.
            </li>
          </ul>
        </Sub>

        <Sub title="3.2 Continuidade e regra da substituição">
          <p>
            Se <InlineMath math="f" /> é contínua em <InlineMath math="a" />, então{" "}
            <InlineMath math="\lim_{x\to a} f(x)=f(a)" />. Polinômios, exponenciais e
            trigonométricas elementares são contínuas em seus domínios. Para{" "}
            <InlineMath math="f" /> que é quociente, é necessário{" "}
            <InlineMath math="g(a)\neq 0" /> no denominador.
          </p>
        </Sub>

        <Sub title="3.3 Descontinuidades removíveis">
          <p>
            Em expressões com fator cancelável, como{" "}
            <InlineMath math="\dfrac{x^2-1}{x-1}" />, há um "buraco" em{" "}
            <InlineMath math="x=1" />. A simplificação algébrica dá{" "}
            <InlineMath math="x+1" />, cuja substituição em <InlineMath math="1" /> é{" "}
            <InlineMath math="2" />. Logo,{" "}
            <InlineMath math="\lim_{x\to 1}\dfrac{x^2-1}{x-1}=2" />.
          </p>
        </Sub>

        <Sub title="3.4 Assíntotas verticais e ±∞">
          <p>
            Quando <InlineMath math="f(x)" /> cresce sem limite em magnitude ao
            aproximar-se de <InlineMath math="a" />, reportamos{" "}
            <InlineMath math="+\infty" /> ou <InlineMath math="-\infty" />. Ex.:{" "}
            <InlineMath math="\lim_{x\to 0^+} \dfrac{1}{x}=+\infty" /> e{" "}
            <InlineMath math="\lim_{x\to 0^-} \dfrac{1}{x}=-\infty" />. O bilateral é
            <i>indeterminado</i> nesse caso, pois os laterais diferem.
          </p>
        </Sub>

        <Sub title="3.5 Formas indeterminadas e Regra de L’Hôpital">
          <p>
            Quando a avaliação direta produz <InlineMath math="0/0" /> ou{" "}
            <InlineMath math="\infty/\infty" />, a Regra de L’Hôpital autoriza
            derivar numerador e denominador:
          </p>
          <BlockMath math="\lim_{x\to a}\frac{f(x)}{g(x)}=\lim_{x\to a}\frac{f'(x)}{g'(x)}" />
          <p>
            desde que os limites dos termos derivadas existam. Ex.:{" "}
            <InlineMath math="\lim_{x\to 0}\frac{\sin x}{x}=1" />. Na aplicação, o
            cálculo simbólico do SymPy cobre esses casos diretamente; L’Hôpital fica
            como teoria de apoio e abordagem alternativa de entendimento.
          </p>
        </Sub>

        <Sub title="3.6 Outras técnicas algébricas clássicas">
          <ul className="list-disc ml-6">
            <li>
              <b>Fatoração:</b> transformar em produto para cancelar fatores comuns.
            </li>
            <li>
              <b>Racionalização:</b> multiplicar pelo conjugado para eliminar raiz no
              numerador/denominador.
            </li>
            <li>
              <b>Identidades trigonométricas:</b>{" "}
              <InlineMath math="\sin^2 x+\cos^2 x=1" />,{" "}
              <InlineMath math="\tan x=\dfrac{\sin x}{\cos x}" />, etc.
            </li>
            <li>
              <b>Teorema do Confronto (Squeeze):</b> útil para{" "}
              <InlineMath math="\lim_{x\to 0}\dfrac{\sin x}{x}=1" />.
            </li>
          </ul>
        </Sub>

        <Sub title="3.7 Funções por partes e existência de limite">
          <p>
            Para funções definidas por partes, o limite bilateral em{" "}
            <InlineMath math="a" /> existe se os dois laterais coincidirem. A ferramenta
            avalia explicitamente esquerda e direita antes de compor o bilateral.
          </p>
        </Sub>
      </Section>

      <Section title="4. Arquitetura técnica">
        <ul className="list-disc ml-6">
          <li>
            <b>SymPy via Pyodide (WebAssembly):</b> carregado em <i>Web Worker</i>{" "}
            clássico para evitar travar a UI. Calcula{" "}
            <InlineMath math="\lim_{x\to a^-} f(x)" /> e{" "}
            <InlineMath math="\lim_{x\to a^+} f(x)" />. O bilateral é decidido a
            partir dos laterais:
            <ul className="list-disc ml-6 mt-2">
              <li>Se ambos finitos e próximos → valor.</li>
              <li>Se ambos +∞ → <InlineMath math="+\infty" />; se ambos −∞ → <InlineMath math="-\infty" />.</li>
              <li>Caso contrário → <i>Indeterminado</i>.</li>
            </ul>
          </li>
          <li>
            <b>Nerdamer:</b> simplificação algébrica da expressão digitada. Geramos o
            LaTeX da forma simplificada com <i>math.js</i> para consistência visual.
          </li>
          <li>
            <b>math.js:</b> parser, avaliação numérica segura para amostragem do
            gráfico e geração de LaTeX das expressões.
          </li>
          <li>
            <b>UI:</b> React + TypeScript + TailwindCSS; tema dark/light; teclado
            matemático responsivo.
          </li>
        </ul>
      </Section>

      <Section title="5. Precisão, limites e casos especiais">
        <ul className="list-disc ml-6">
          <li>
            <b>Precisão simbólica:</b> SymPy resolve limites padrão de cursos de
            Cálculo I/II com alta fidelidade. Casos patológicos podem exigir tempo de
            carga do Pyodide na primeira execução.
          </li>
          <li>
            <b>Domínio:</b> a ferramenta respeita o domínio natural das funções. Ex.:
            <InlineMath math="\ln x" /> só para <InlineMath math="x&gt;0" />;{" "}
            <InlineMath math="\sqrt{x}" /> para <InlineMath math="x\ge 0" />.
          </li>
          <li>
            <b>Oscilação:</b> funções como <InlineMath math="\sin(1/x)" /> em{" "}
            <InlineMath math="x\to 0" /> não possuem limite bilateral nem laterais;
            o sistema retorna <i>Indeterminado</i>.
          </li>
          <li>
            <b>Assíntotas verticais:</b> reportadas como{" "}
            <InlineMath math="+\infty" /> ou <InlineMath math="-\infty" /> quando o
            sinal é consistente.
          </li>
        </ul>
      </Section>

      <Section title="6. Exemplos rápidos">
        <ul className="list-disc ml-6">
          <li>
            <InlineMath math="\lim_{x\to 1}\dfrac{x^2-1}{x-1}=2" /> (removível; forma simplificada{" "}
            <InlineMath math="x+1" />).
          </li>
          <li>
            <InlineMath math="\lim_{x\to 0}\dfrac{\sin x}{x}=1" /> (forma indeterminada{" "}
            <InlineMath math="0/0" />, resolvida simbolicamente).
          </li>
          <li>
            <InlineMath math="\lim_{x\to 0^+}\dfrac{1}{x}=+\infty" />,{" "}
            <InlineMath math="\lim_{x\to 0^-}\dfrac{1}{x}=-\infty" />, bilateral{" "}
            <i>Indeterminado</i>.
          </li>
          <li>
            <InlineMath math="\lim_{x\to 0}\dfrac{1-\cos x}{x}=0" />.
          </li>
        </ul>
      </Section>

      <Section title="7. Roadmap">
        <ul className="list-disc ml-6">
          <li>
            <b>Derivadas:</b> simbólica (SymPy/Nerdamer) + numérica para verificação;
            gráfico de <InlineMath math="f'(x)" /> e reta tangente.
          </li>
          <li>
            <b>Integrais:</b> indefinidas (simbólicas) e definidas (numéricas: Simpson
            ou Gauss); áreas e somas de Riemann.
          </li>
          <li>
            <b>Limites em infinito:</b> análise de assíntotas horizontais/oblíquas.
          </li>
          <li>
            <b>Funções por partes:</b> editor visual para nós de partição.
          </li>
        </ul>
      </Section>

      <Section title="8. Créditos tecnológicos">
        <TechList />

      </Section>

      <Footer />
    </section>
  );
}

/* ---------- Componentes auxiliares ---------- */

function Header() {
  return (
    <div>
      <h2 className="text-xl font-semibold">Documentação</h2>
      <p className="text-sm text-gray-600 dark:text-slate-300">
        Guia conceitual e técnico da Calculadora de Cálculo — Limites.
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-base font-medium">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Details({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="rounded-lg border p-3 bg-gray-50 dark:bg-slate-800/60 dark:border-slate-700">
      <summary className="cursor-pointer select-none font-medium">{title}</summary>
      <div className="mt-2 space-y-2">{children}</div>
    </details>
  );
}

function TechList() {
  return (
    <ul className="list-disc ml-6">
      <li>
        <b>React + TypeScript + Vite:</b> base de SPA com tipagem segura e bundling rápido.
      </li>
      <li>
        <b>TailwindCSS:</b> utilitários para layout responsivo e tema dark/light.
      </li>
      <li>
        <b>math.js:</b> parsing de expressão, avaliação numérica segura e geração de LaTeX.
      </li>
      <li>
        <b>KaTeX:</b> renderização LaTeX de alta performance.
      </li>
      <li>
        <b>Nerdamer:</b> simplificação algébrica simbólica da entrada.
      </li>
      <li>
        <b>SymPy via Pyodide (WASM):</b> cálculo de limites precisos em <i>Web Worker</i>
        clássico, sem travar a UI.
      </li>
    </ul>
  );
}

function Footer() {
  return ('');
}