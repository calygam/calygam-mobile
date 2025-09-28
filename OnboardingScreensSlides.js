import Bem_Vindo from './assets/Svg/IconsOnboading/Raising hand-bro 1.svg';
import Atividades from './assets/Svg/IconsOnboading/Success factors-bro 1.svg';
import Evolua from './assets/Svg/IconsOnboading/Task-bro 1.svg';


// Exporta uma lista (array) com os slides
export default [
    {
        id: '1', // Identificador Unico necessario pro FlatList
        title: 'Bem-vindo às Trilhas de Aprendizagem',
        description: 'Um espaço para alunos e professores caminharem juntos no aprendizado.',
        SvgComponent: Bem_Vindo,
        },
    {
        id: '2',
        title: 'Envie suas atividades com praticidade',
        description: 'Cada trilha é uma jornada: você acompanha seu progresso e compartilha tarefas diretamente com os professores.',
        SvgComponent: Atividades,
        backgroundColor: '#CE82FF'
        },
    {
        id: '3',
        title: 'Aprenda, evolua e conquiste resultados!',
        description: 'Explore as trilhas, desenvolva novas habilidades e avance no seu aprendizado.',
        SvgComponent: Evolua,
        },
    ];