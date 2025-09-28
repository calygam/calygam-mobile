import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Montanha from "../../../src/screens/HomePage/SvgMontanha/Montanha";
import Cards from '../../components/CardHomeExplorar/Card';
import IOTIcon from "../../../assets/Svg/IconsCardExplorar/site-alt 1.svg";
import FigmaIcon from "../../../assets/Svg/IconsCardExplorar/Group.svg";
import AdobeIcon from "../../../assets/Svg/IconsCardExplorar/illustrator 1.svg";
import ExcelIcon from "../../../assets/Svg/IconsCardExplorar/file-excel 1.svg";

export default function Homepage() {
    return (
        <View style={styles.container}>
            <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', gap: 10 }}>

                {/* Fundo */}
                <View style={styles.background}>
                    <LinearGradient
                        colors={["#FF7121", "#5A189A"]}
                        style={styles.background}
                    />
                </View>

                {/* Sun */}
                <View style={styles.SunContainer}>
                    <View>
                        <LinearGradient
                            colors={["#FFD95E", "#FFB300"]}
                            style={styles.Sun}
                        />
                    </View>
                </View>

                {/* Montanha */}
                <View style={styles.MontanhaContainer}>
                    <View style={styles.MontanhaView}>
                        <Montanha />
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
                        <View style={{ top: 5, flexDirection: 'row', }}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.scrollContainer}
                            >
                                <Cards title="IOT" Icon={IOTIcon} />
                                <Cards title="Figma" Icon={FigmaIcon} />
                                <Cards title="Adobe" Icon={AdobeIcon} />
                                <Cards title="Excel" Icon={ExcelIcon} />
                            </ScrollView >
                        </View>

                        {/* Button Ver Mais */}
                        <View>
                            <TouchableOpacity style={styles.Button}>
                                <Text style={{ color: '#FFF', fontSize: 15 }}>Ver Mais</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Texto Mascote */}
                <View style={styles.MascoteContainer}>
                    <View style={styles.VemNenem}>
                        <View style={styles.ProBraçosdoPapai}>
                            <Text style={{ color: '#FFF', fontSize: 16, left: 25 }}>Meu Mascote</Text>
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
        height: '55%',
        position: 'absolute',
        top: 0
    },
    SunContainer: {
        top: 40, // Adjusted to move sun down
        alignSelf: 'center',
    },
    Sun: {
        width: 160,
        height: 160,
        borderRadius: 100,
    },
    MontanhaContainer: {
        alignSelf: 'center',
        width: '100%',
        height: 230,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    MontanhaView: {
        top: -10, // Adjusted to move mountain down
        justifyContent: 'flex-start',
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
        textAlign: 'center'
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
        width: '90%',
        flex: 1,
        // backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 30,
        padding: 5,

    },
    scrollContainer: {
        gap: 30,
        width: 415,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center'
    },
    MascoteContainer: {
        // backgroundColor: '#faedcd',
        width: 'auto',
        height: 360,
        justifyContent: 'center'
    },
    VemNenem: {
        // backgroundColor: '#fca311',
        width: 'auto',
        height: 340,
        marginTop: 25,
        justifyContent: 'center'

    },
    ProBraçosdoPapai: {
        // backgroundColor: '#219ebc',
        paddingTop: 20,
        paddingLeft: 2,
        paddingRight: 10,
        paddingBottom: 20,

    }
});