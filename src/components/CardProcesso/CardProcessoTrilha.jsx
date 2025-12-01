import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import IconSeta from "../../../assets/svg/IconsCardExplorar/angulo-direito1.svg";
import React from 'react'
import { iconMap } from '../IconsModal/Icons';

export default function CardProcessoTrilha({
  title = 'Trilha',
  progress = 0,
  onContinue,
    iconSource,
    iconKey,
    trailImage, // 🆕 URL da imagem real do backend
}) {

    const renderIcon = () => {
        // 1️⃣ PRIORIDADE: Imagem real do backend (via /file/read/{uuid})
        const hasValidImage = trailImage && 
                             !trailImage.includes('/file/read/null') && 
                             !trailImage.includes('null') &&
                             !trailImage.endsWith('/file/read/') &&
                             trailImage.length > 40; // URL válida tem UUID
        
        if (hasValidImage) {
            return (
                <Image 
                    source={{ uri: trailImage }} 
                    style={{ width: '100%', height: '100%', borderRadius: 12 }} 
                    resizeMode="cover"
                />
            );
        }

        // 2️⃣ Tenta usar o mesmo mapeamento de ícones das "Trilhas Disponíveis"
        const key = iconKey ? String(iconKey).toLowerCase().replace(/[^a-z0-9]/g, '') : null;
        const IconComponent = key ? iconMap[key] : null;
        if (IconComponent) {
            return <IconComponent width={24} height={24} fill="#FFF" />;
        }

        // 3️⃣ Se foi passado um source de imagem (remota/local), usa
        if (iconSource) {
            return <Image source={iconSource} style={{ width: 24, height: 24 }} />;
        }

        // 4️⃣ Fallback
        return <Image source={require('../../../assets/image/ImagemSem.png')} style={{ width: 24, height: 24 }} />;
    };

  return (
    <View style={styles.container}>
          {/* Card de progresso da trilha que o usuario está participando */}
          <View style={styles.CardProgress}>
              <View style={{ justifyContent: 'flex-start', alignItems: 'center', gap: 10, flexDirection: 'row', width: '100%', height: '35%' }}>
                  <View style={[styles.FotoIconTrilha, { backgroundColor: '#cd82ff3f' }]}>
                                            {renderIcon()}
                  </View>
                  <Text style={{ color: '#FFFFFFFF', fontSize: 16, textAlign: 'center' }}>{title}</Text>
              </View>

              <Text style={styles.progressoTexto}>Progresso: {Math.max(0, Math.min(100, Math.round(progress)))}%</Text>

              {/* BARRA DE PROGRESSO */}
              <View style={styles.progressBackground}>
                  <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, progress))}%` }]} />
              </View>

              <View style={{ justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: 8, }}>
                  <TouchableOpacity style={{ width: '90%', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 5 }} onPress={onContinue}>
                      <Text style={{ color: '#CE82FF', fontSize: 14, textAlign: 'right', width: '75%' }}>Continuar</Text>
                      <IconSeta width={15} height={24} fill="#CE82FF" />
                  </TouchableOpacity>
              </View>
          </View>
    </View>
  )
}

const styles = StyleSheet.create({
    CardProgress: {
        width: '100%',
        height: 180,
        backgroundColor: 'rgba(90, 24, 154, 0.4)',
        borderWidth: 2,
        borderColor: '#5A189A',
        borderRadius: 20,
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    FotoIconTrilha: {
        height: 45,
        width: 45,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        justifyContent: 'center',
        alignItems: 'flex-start',
        height: 'auto',
    },
    progressoTexto: {
        color: "white",
        width: "100%",
        textAlign: "left",
        fontSize: 14,
    },

    progressBackground: {
        width: "100%",
        height: 8,
        backgroundColor: "#d9d9d9",
        borderRadius: 10,
        marginTop: 5,
    },

    progressFill: {
        height: "100%",
        backgroundColor: "#5f5cff", // cor igual ao do print
        borderRadius: 10,
    },
    
})



