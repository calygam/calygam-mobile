import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import IconVagas from "../../../assets/svg/users-alt rosa.svg";
import IconLixo from "../../../assets/svg/lixo.svg";
import IconLapis from "../../../assets/svg/lapis.svg";

export default function CardProf({titulo, professorNome, vagas, de}) {

    return (
        <View style={styles.container}>
            {/* Card */}
            <View style={styles.card}>
                {/* Nome da Trilha e Status */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Text style={{ color: '#021713', width: '55%', fontSize: 16 }}>{titulo}</Text>
                    <View style={styles.Status}>
                        <Text style={{ color: '#FE1A59' }}>Desativado</Text>
                    </View>
                </View>

                {/* Informações do Professor */}
                <View style={styles.foto}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#CCC' }} />
                    <Text style={{ color: '#B3B3B3' }}>Prof: {professorNome}</Text>
                </View>

                {/* Vagas e Inscritos */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '90%' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10}}>
                        <IconVagas width={20} height={20} />
                        <Text style={{ color: '#CE82FF' }}>Vagas: {vagas}</Text>
                    </View>
                    {/* Botoes de editar e excluir */}
                    <View style={{ flexDirection: 'row', gap: 15}}>
                        <TouchableOpacity>
                            <IconLapis width={20} height={20} />
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <IconLixo width={20} height={20} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>



        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#021713',
        gap: 35
    },
    Status: {
        width: 'auto',
        height: 40,
        paddingHorizontal: 15,
        borderRadius: 40,
        backgroundColor: '#f64b1288',
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    card: {
        width: '95%',
        height: 190,
        backgroundColor: '#FFF',
        borderRadius: 35,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginVertical: 10,
        paddingRight: 20,
        paddingLeft: 20,
        paddingTop: 15,
        paddingBottom: 25,

    },
    foto: {
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        flexDirection: 'row',
    }
})