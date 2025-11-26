import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Montanha from "./SvgMontanha/Montanha"
import Cards from '../../components/CardHomeExplorar/Card';
import CardProcessoTrilha from '../../components/CardProcesso/CardProcessoTrilha';
import IOTIcon from "../../../assets/svg/IconsCardExplorar/site-alt-1.svg";
import FigmaIcon from "../../../assets/svg/IconsCardExplorar/figma.svg";
import AdobeIcon from "../../../assets/svg/IconsCardExplorar/illustrator-1.svg";
import ExcelIcon from "../../../assets/svg/IconsCardExplorar/file-excel-1.svg";
import CachorroIcon from "../../../assets/svg/undraw_page-eaten_b2rt 1.svg";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import CUzinho from "./SvgMontanha/Montanha"
import { Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import IconCoins from '../../../assets/svg/IconsInterface/coin.svg';
import RankIcon from '../../components/RankIcon';
import { computeRankProgress } from '../../utils/rankUtils';
import React, { useState, useEffect, } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { readProgress } from '../../services/progressService';

const { width } = Dimensions.get('window');
const SIZE = width * 0.55; // tamanho do círculo principal

export default function Homepage() {

    const [userName, setUserName] = useState();
    const [recentTrails, setRecentTrails] = useState([]);
    const navigation = useNavigation();

    const xp = userName?.userXp ?? 0;
    const rankName = userName?.userRank ?? 'BRONZE-I';
    const coins = userName?.userMoney ?? 0;
    const { current, next, progress, nextPoints } = computeRankProgress(xp);

    // Se rankName vier do back e divergir do cálculo local, priorizamos o back.
    const displayRank = rankName || current.name;

    // Cálculo do caminho da barra de progresso (círculo com borda grossa)
    const strokeWidth = 5;
    const radius = (SIZE / 2) - (strokeWidth * 2);
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);

    useEffect(() => {
        const loadUser = async () => {
            const data = await AsyncStorage.getItem("userInfo");
            if (data) {
                setUserName(JSON.parse(data));
            }
        };

        loadUser();
    }, []);

    // Função para carregar trilhas recentes
    const loadRecentTrails = async () => {
        try {
            const rawUser = await AsyncStorage.getItem('userInfo');
            const parsed = rawUser ? JSON.parse(rawUser) : null;
            const uid = parsed?.uid || parsed?.userId || parsed?.id || parsed?.email || 'anon';
            const joinedKey = `joinedTrails:${uid}`;
            const rawJoined = await AsyncStorage.getItem(joinedKey);
            const joinedArr = rawJoined ? JSON.parse(rawJoined) : [];

            // Pegar as últimas 3 trilhas
            const recent = joinedArr.slice(-3).reverse(); // Mais recentes primeiro

            // Para cada trilha, calcular progresso
            const trailsWithProgress = await Promise.all(
                recent.map(async (trail) => {
                    try {
                        const progressData = await readProgress(trail.trailId);
                        const activitiesCompleted = progressData?.activitiesCompleted || 0;
                        const totalActivities = progressData?.progressList?.length || 1;
                        const progressPercent = totalActivities > 0 ? (activitiesCompleted / totalActivities) * 100 : 0;
                        return {
                            ...trail,
                            progress: progressPercent,
                            iconKey: trail.trailName.toLowerCase() // ou algum campo de ícone
                        };
                    } catch (error) {
                        console.warn('Erro ao calcular progresso para trilha', trail.trailId, error);
                        return {
                            ...trail,
                            progress: 0,
                            iconKey: trail.trailName.toLowerCase()
                        };
                    }
                })
            );

            setRecentTrails(trailsWithProgress);
        } catch (error) {
            console.warn('Erro ao carregar trilhas recentes:', error);
            setRecentTrails([]);
        }
    };

    // Recarrega dados quando a tela ganha foco (ex: após voltar de atividade)
    useFocusEffect(
        React.useCallback(() => {
            const loadData = async () => {
                const data = await AsyncStorage.getItem("userInfo");
                if (data) {
                    setUserName(JSON.parse(data));
                }
                await loadRecentTrails();
            };
            loadData();
        }, [])
    );

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, width: '100%' }} contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', gap: 10 }}>

                {/* Fundo */}
                <View style={styles.background}>
                    <LinearGradient
                        colors={["#FF7121", "#5A189A"]}
                        style={styles.background}
                    />
                </View>


                <View style={styles.SunContainer}>
                    {/* Círculo principal com gradiente laranja-amarelo */}
                    <LinearGradient
                        colors={['#FFD95E', '#FFB300']} // tons do Bronze do Duolingo
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.circle}
                    >
                        {/* Barra de progresso circular */}
                        <Svg height={SIZE} width={SIZE} style={StyleSheet.absoluteFill}>
                            {/* Fundo cinza da barra */}
                            <Circle
                                cx={SIZE / 2}
                                cy={SIZE / 2}
                                r={radius}
                                stroke="#FFFFFF44"
                                strokeWidth={strokeWidth}
                                fill="none"
                            />
                            {/* Progresso preenchido (verde) */}
                            <Circle
                                cx={SIZE / 2}
                                cy={SIZE / 2}
                                r={radius}
                                stroke="#ff9d00f0"
                                strokeWidth={strokeWidth}
                                fill="none"
                                strokeDasharray={`${circumference}, ${circumference}`}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                rotation="-90"
                                originX={SIZE / 2}
                                originY={SIZE / 2}
                            />
                        </Svg>

                        {/* Conteúdo interno */}
                        <View style={styles.content}>
                            {/* Ícone do Rank */}
                            <View style={styles.medal}>
                                <RankIcon xp={xp} rankName={rankName} width={35} height={35} />

                                {/* Título */}
                                <Text style={styles.title}>{displayRank}</Text>
                            </View>


                            {/* XP atual / meta */}
                            <Text style={styles.xpText}>
                                {next ? (
                                    <Text><Text style={styles.xpCurrent}>{xp}</Text> / {nextPoints} XP</Text>
                                ) : (
                                    <Text><Text style={styles.xpCurrent}>{xp}</Text> XP (Máximo)</Text>
                                )}
                            </Text>

                            {/* Recompensa de moedas */}
                            <View style={styles.coinsContainer}>
                                <IconCoins width={20} height={20} />
                                <Text style={styles.coinsText}>Coins: {coins}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* Montanha */}
                <View style={styles.MontanhaContainer}>
                    <View style={styles.MontanhaView}>
                        <CUzinho Monta={Montanha} />
                    </View>
                </View>

                {/* Texto */}
                <View style={{ justifyContent: 'center', alignItems: 'center', padding: 20, gap: 14, marginTop: 20 }}>
                    <Text style={styles.Titulo}>
                        Caminhos
                    </Text>
                    <Text style={styles.SubTitulo}>
                        Explore seus caminhos de aprendizagem
                    </Text>
                    <Text style={styles.Texto}>
                        Descubra os caminhos de aprendizagem que você está seguindo. Acompanhe seu progresso e avance em sua jornada educacional.
                    </Text>
                </View>

                {/* Texto Explorar */}
                <View style={styles.ExplorarContainer}>
                    <View style={styles.TextExplorar}>
                        <Text style={{ color: '#FFF', fontSize: 20, textAlign: 'left', paddingLeft: 0 }}>
                            Explorar Trilha
                        </Text>
                    </View>
                    

                    <View style={styles.Card}>
                        {/* Cards */}
                        <View style={{  }}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{
                                    gap: 15,
                                    paddingVertical: 20,
                                    paddingHorizontal: 10,
                                    
                                    
                                }}
                            >
                                {recentTrails.length > 0 ? (
                                    recentTrails.map((trail, index) => (
                                        <CardProcessoTrilha
                                            key={trail.trailId}
                                            title={trail.trailName}
                                            progress={trail.progress}
                                            iconKey={trail.iconKey}
                                            onContinue={() => navigation.navigate('TrailPage', { trailId: trail.trailId })}
                                        />
                                    ))
                                ) : (
                                    <>
                                        <Cards title="IOT" Icon={IOTIcon} />
                                        <Cards title="Figma" Icon={FigmaIcon} />
                                        <Cards title="Adobe" Icon={AdobeIcon} />
                                        <Cards title="Excel" Icon={ExcelIcon} />
                                    </>
                                )}
                            </ScrollView >
                        </View>

                        {/* Button Ver Mais */}
                        <View>
                            <TouchableOpacity style={styles.Button} onPress={() => navigation.navigate('Biblioteca', { screen: 'BibliotecaCursos' })} >
                                <Text style={{ color: '#FFF', fontSize: 15 }}>Ver Mais </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Texto Mascote */}
                <View style={styles.MascoteContainer}>
                    <View style={styles.VemNenem}>
                        <View style={styles.ProBraçosdoPapai}>
                            
                            <Text style={{ color: '#FFF', fontSize: 18, left: 25, fontWeight: 'bold' }}>Meu Mascote</Text>
                            <Text style={{ color: '#FFF', fontSize: 15, padding: 20, fontWeight: '700' }}>Ops! Você ainda não tem nenhum mascote</Text>
                            <Text style={{ color: '#FFF', fontSize: 15, padding: 20, fontWeight: '200' }}>Conheça os benefícios de ter um pet no seu dia a dia e descubra como adotar seu novo melhor amigo de forma responsável e consciente!</Text>
                            
                            <View>
                                <TouchableOpacity style={{
                                    width: 103,
                                    height: 44,
                                    backgroundColor: '#6C63FF',
                                    borderRadius: 20,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginLeft: 15
                                }}>
                                    <Text style={{ color: '#FFF', fontSize: 15 }}>Ver Mais</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#021713',
        alignItems: 'center',
        justifyContent: 'center',
    },
    background: {
        width: '100%',
        height: '45%',
        position: 'absolute',
        top: 0
    },
    SunContainer: {
        top: 40, // Adjusted to move sun down
        alignSelf: 'center',
        width: 170,
        height: 170,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    MontanhaContainer: {
        alignSelf: 'center',
        width: '100%',
        height: 230,
        justifyContent: 'flex-start',
        alignItems: 'center',
        // backgroundColor: 'blue'
    },
    MontanhaView: {
        top: -40, // Adjusted to move mountain down
        justifyContent: 'flex-start',
        // backgroundColor: 'red',
        width: '100%',
        height: '100%',

    },
    Titulo: {
        fontSize: 16,
        color: '#FFF',
    },
    SubTitulo: {
        color: '#FFF',
        fontSize: 20,
        textAlign: 'center'
    },
    Texto: {
        color: '#FFF',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '100'
    },
    TextExplorar: {
        width: '90%',
        height: 55,
        justifyContent: 'center',

    },
    Button: {
        width: 103,
        height: 44,
        backgroundColor: '#6C63FF',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',

    },
    ExplorarContainer: {
        width: '100%',
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: '#1A374D'
    },
    Card: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '80%',
        
    },
    MascoteContainer: {
        width: 'auto',
        height: 'auto',
        justifyContent: 'center',
        alignItems: 'center',
    },
    VemNenem: {
        width: 'auto',
        height: 'auto',
        marginTop: 25,
        justifyContent: 'center',
        alignItems: 'center',

    },
    ProBraçosdoPapai: {
        height: 'auto',
        width: '100%',
        paddingTop: 20,
        paddingLeft: 2,
        paddingRight: 10,
        paddingBottom: 150,
        zIndex: -0,

    },

    // estilos De teste

    containerSla: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    circle: {
        width: SIZE,
        height: SIZE,
        borderRadius: SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    medal: {
        width: 'auto',
        height: 'auto',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 5,
        marginBottom: 8,
    },
    medalIcon: {
        fontSize: 15,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#5D4037',
        marginBottom: 8,
    },
    xpText: {
        fontSize: 14,
        color: '#5D4037',
        marginBottom: 8,
    },
    coinsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    coinsIcon: {
        fontSize: 14,
        marginRight: 2,
    },
    coinsText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#5D4037',
    },
});