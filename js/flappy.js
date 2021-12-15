//Funcao que cria um elemento com uma tag e uma classe qualquer
function novoElemento(tagName, className) {

    const elem = document.createElement(tagName);
    elem.className = className;

    return elem;
}

//Funcao para criar um obstaculo, o parametro diz se ela esta em baixo ou em cima da div
function barreira(reversa = false) {

    //cria os elementos para gerar o obstaculo completo
    this.elemento = novoElemento('div', 'barreira');
    const borda = novoElemento('div', 'borda');
    const corpo = novoElemento('div', 'corpo');

    //a ordem do corpo e da borda varia de acordo com parametro
    //define se ela aparecera invertida ou nao na tela
    this.elemento.appendChild(reversa ? corpo : borda);
    this.elemento.appendChild(reversa ? borda : corpo);

    //funcao que define altura de um obstaculo
    this.setAltura = altura => corpo.style.height = `${altura}px`;
}

//Funcao que cria o par de obstaculos, um em cima e outro em baixo
function parDeBarreiras(altura, abertura, x) {

    //cria a div do par
    this.elemento = novoElemento('div', 'par-de-barreiras');

    //cria os dois obstaculos
    this.superior = new barreira(true);
    this.inferior = new barreira(false);

    //agrupa nessa div tudo sobre os obstaculos
    this.elemento.appendChild(this.superior.elemento);
    this.elemento.appendChild(this.inferior.elemento);

    //funcao que sorteia aonde sera a abertura daquele obstaculo e altura deles
    this.sortearAbertura = () => {

        //calcula aleatoriamente uma altura para obstaculo superior
        const alturaSuperior = Math.random() * (altura - abertura);
        //a altura inferior sera o resto para ficar somente a abertura para passar
        const alturaInferior = altura - abertura - alturaSuperior;

        this.superior.setAltura(alturaSuperior);
        this.inferior.setAltura(alturaInferior);
    }

    //funcao que rotorna posicao x do par
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0]);
    //funcao que define o x onde vai aparecer o par de barreiras
    this.setX = x => this.elemento.style.left = `${x}px`;
    //funcao que retorna a largura do obstaculo
    this.getLargura = () => this.elemento.clientWidth;

    this.sortearAbertura();
    this.setX(x);
}

//funcao que cria e controla todos os obstaculos
function barreiras(altura, largura, abertura, espaco, notificarPonto) {

    //gera todos obstaculos
    this.pares = [
        new parDeBarreiras(altura, abertura, largura),
        new parDeBarreiras(altura, abertura, largura + espaco),
        new parDeBarreiras(altura, abertura, largura + espaco * 2),
        new parDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    //controla a "velocidade" da animacao
    const deslocamento = 3;

    //funcao que controla a movimentacao dos obstaculos
    this.animar = () => {

        this.pares.forEach(par => {

            //desloca o obstaculo
            par.setX(par.getX() - deslocamento);
            
            //verifica se o obstaculo saiu da tela
            if (par.getX() < -par.getLargura()) {
                console.log(this.pares.length);
                //se saiu entao reposiciona ele no final para reaproveitar o obstaculo
                par.setX(par.getX() + espaco * this.pares.length);
                //sorteia para mudar a abertura
                par.sortearAbertura();
            }

            //meio do eixo x onde esta o passaro
            const meio = largura / 2;

            //se o par passou entao o usuario pontuou 
            /*
                quando aplicado essas duas formulas e ambas forem
                verdadeiras entao obstaculo passou pelo meio
                logo usuario marcou um ponto        
            */
            //const pontuou = par.getX() + deslocamento >= meio && par.getX() < meio

            /* if(pontuou){
                notificarPonto();
            } */
        });
    }
}

const b = new barreiras(700, 1100, 200, 400);
const areaJogo = document.querySelector('[wm-flappy]');
b.pares.forEach(par => areaJogo.appendChild(par.elemento));


setInterval(() => {
    b.animar();
}, 20); 