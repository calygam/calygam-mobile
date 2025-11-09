import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#021713',
        paddingTop: 55,
        color: '#FFF',
        gap: 35
    },
    modalTitle: {
        fontSize: 24,
        color: '#FFF',
        marginBottom: 20,
        alignSelf: 'center'
    },
    input: {
        backgroundColor: '#ffffff1a',
        borderRadius: 18,
        padding: 12,
        color: '#ffffffff',
        marginBottom: 12,
        width: '95%',
        height: 50,
        alignSelf: 'center',
        borderColor: '#D9D9D933',
        borderWidth: 2,
    },
    confirmButton: {
        backgroundColor: '#6C63FF',
        padding: 14,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 10
    },
    confirmText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold'
    },
    cancelButton: {
        backgroundColor: '#FF4B4B',
        padding: 14,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 10
    },
    cancelText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold'
    },
    modalContent: {
        flex: 1,
        padding: 15,
        color: '#fff',
        backgroundColor: '#0D141C',
    },
    label: {
        color: '#FFF',
        marginBottom: 5,
        marginTop: 10,
    }
});

export default styles;