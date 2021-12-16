//Funcao que cria um elemento com uma tag e uma classe qualquer
function novoElemento(tagName, className) {

    const elem = document.createElement(tagName);
    elem.className = className;

    return elem;
}

//Funcao para criar um obstaculo, o parametro diz se ela esta em baixo ou em cima da div
function Barreira(reversa = false) {

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
function ParDeBarreiras(altura, abertura, x) {

    //cria a div do par
    this.elemento = novoElemento('div', 'par-de-barreiras');

    //cria os dois obstaculos
    this.superior = new Barreira(true);
    this.inferior = new Barreira(false);

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
function Barreiras(altura, largura, abertura, espaco, notificarPonto) {

    //gera todos obstaculos
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
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
            const pontuou = par.getX() + deslocamento >= meio && par.getX() < meio

            if(pontuou){
                notificarPonto();
            } 
        });
    }
}

function Passaro(alturaJogo) {

    //variavel que diz quando o passaro ira subir
    let voando = false;

    //cria o elemento passaro
    this.elemento = novoElemento('img', 'passaro');
    this.elemento.src = '../img/passaro.png';

    //funcao para pegar a altura do passaro no eixo y
    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0]);
    //funcao para definir uma nova altura no eixo y
    this.setY = y => this.elemento.style.bottom = `${y}px`;

    //eventos que pegam quando uma tecla foi apertada ou solta para fazer o passaro subir
    window.onkeydown = e => voando = true;
    window.onkeyup = e => voando = false;

    //funcao de animacao que faz o passaro ficar mudando altura no eixo y
    this.animar = () => {

        //define a nova altura baseando se esta em queda ou voando
        //8 e -7 podemos e a velocidade que sobe ou cai
        const novoY = this.getY() + (voando ? 8 : -6);
        //define altura max do jogo subtraindo do tamanho da tela o tamanho do passaro e o tamanho da borda
        const alturaMax = alturaJogo - this.elemento.clientHeight - 10;

        //verificacao para nova altura do passaro
        if (novoY <= 0) {

            //para ele nao sumir pela parte de baixo da tela
            //mudar para colisao depois
            this.setY(0);
        } else if (novoY >= alturaMax) {

            //para evitar que ele suma da tela por cima
            this.setY(alturaMax);
        } else {

            //caso esteja tudo certo ele varia y na tela
            this.setY(novoY);
        }

    }

    //define a posicao inicial do passaro no meio da tela
    this.setY(alturaJogo / 2);
}

function Progresso() {
    this.elemento = novoElemento('span', 'progresso');
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos;
    }

    this.atualizarPontos(0);
}

//Funcao que verifica se dois elementos estao se sobrepondo
function sobreposicao(elementoA, elementoB) {

    //elementos a serem verificados
    const a = elementoA.getBoundingClientRect();
    const b = elementoB.getBoundingClientRect();

    //verifica se houve sobreposicao no eixo x
    const horizontal = ( a.left + a.width >= b.left ) && ( b.left + b.width >= a.left );
    
    //verifica se houve sobreposicao no eixo y
    const vertical = ( a.top + a.height >= b.top ) && ( b.top + b.height >= a.top );
 
    return horizontal && vertical;
}

//Funcao que verifica se o passaro colidiu com alguma das barreiras do par
function colidiu(passaro, barreiras) {

    let colidiu = false;

    //verifica para cada par de barreira
    barreiras.pares.forEach(ParDeBarreiras => {

        //entra apenas se nao houve colisao ainda
        if(!colidiu) {

            //par de obstaculos
            const superior = ParDeBarreiras.superior.elemento;
            const inferior = ParDeBarreiras.inferior.elemento;

            //chama a funcao q verifica se houve a sobreposicao
            //se houve na superior ou na inferior retorna true
            colidiu = sobreposicao(passaro.elemento, superior) || sobreposicao(passaro.elemento, inferior)
        }
    });

    return colidiu;
}

function FlappyBird(){

    let pontos = 0;

    //define a area do jogo
    const areaJogo = document.querySelector('[wm-flappy]');
    const altura = areaJogo.clientHeight;
    const largura = areaJogo.clientWidth;

    //constroi cada elemento
    const progresso = new Progresso();
    const passaro = new Passaro(altura);
    const obstaculo = new Barreiras(altura, largura, 200, 400, 
        () => progresso.atualizarPontos(++pontos));
    
    //coloca cada elemento na tela de jogo
    areaJogo.appendChild(progresso.elemento);
    areaJogo.appendChild(passaro.elemento);
    obstaculo.pares.forEach(par => areaJogo.appendChild(par.elemento));

    //funcao que inicia o jogo
    this.start = () => {

        const temporizador = setInterval(() => {

            obstaculo.animar();
            passaro.animar();

            //verifica se houve colisao
            if (colidiu(passaro, obstaculo)) {
                clearInterval(temporizador);
            }
        }, 20); 
    }

}

new FlappyBird().start();