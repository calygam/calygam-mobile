import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useAlert } from '../ModaisAlertas/AlertProvider'
import IconVagas from "../../../assets/svg/users-alt rosa.svg";
import IconLixo from "../../../assets/svg/lixo.svg";
import IconLapis from "../../../assets/svg/lapis.svg";

export default function CardProf({titulo, professorNome, vagas, foto, onEdit, onPublish, item}) {
    const alert = useAlert();

    const getStatusInfo = () => {
        const raw = String(item?.trailStatus ?? item?.status ?? "").toUpperCase();

        if (raw === "DESABLED") {
            return {
                label: "Desativada",
                bg: "#f64b1288",
                color: "#FE1A59"
            };
        }

        if (raw === "BUILDING") {
            return {
                label: "Em construção",
                bg: "#ffc32b90",
                color: "#D9904B"
            };
        }

        // Default → ENABLE
        return {
            label: "Ativa",
            bg: "#ccff3390",
            color: "#34A853"
        };
    };

    const statusInfo = getStatusInfo();

    return (
        <View style={styles.container}>
            {/* Card */}
            <View style={styles.card}>
                {/* Nome da Trilha e Status */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Text style={{ color: '#021713', width: '50%', fontSize: 16 }}>{titulo}</Text>
                    <View style={[styles.Status, { backgroundColor: statusInfo.bg }]}>
                        <Text style={{ color: statusInfo.color }}>{statusInfo.label}</Text>
                    </View>
                </View>

                {/* Informações do Professor */}
                <View style={styles.foto}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#CCC' }}>{foto}</View>
                    <Text style={{ color: '#B3B3B3' }}>Prof: {professorNome}</Text>
                </View>

                {/* Vagas e Inscritos */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10}}>
                        <IconVagas width={20} height={20} />
                        <Text style={{ color: '#CE82FF' }}>Vagas: {vagas}</Text>
                    </View>
                    {/* Botoes de editar e excluir */}
                    <View style={{ flexDirection: 'row', gap: 25}}>

                        {String(item?.trailStatus).toUpperCase() !== 'ENABLE' && (
                            <TouchableOpacity onPress={() => onPublish && onPublish(item)}>
                                <Text style={{ color: '#8A51E8', fontSize: 12 }}>Publicar</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity onPress={() => onEdit && onEdit(item)}>
                            <IconLapis width={20} height={20} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => alert.warning('Excluir Trilha', 'Funcionalidade ainda não implementada.')}>
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
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#021713',
        gap: 35,
        width: '100%'
    },
    Status: {
        width: 'auto',
        height: 40,
        paddingHorizontal: 20,
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