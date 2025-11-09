import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Homepage from "../screens/HomePage/Homepage";
import BibliotecaCursos from "../screens/PageBiblioteca/BibliotecaCursos";
import ShopPage from "../screens/ShopPage/ShopPage";
import CriarTrilha from "../screens/PageProfessorCriarTrilha/CriarTrilha";
import Trail from "../screens/TrailPage/Trail";
import useUserRole from "../hooks/useUserRole";

// Icon Tab Naviagtion
import IconHomeAtivo from '../../assets/svg/IconsTabBottom/group-1.svg'
import IconHomeDesabilitado from '../../assets/svg/IconsTabBottom/casa-1-2.svg'

import IconLivroAtivo from '../../assets/svg/IconsTabBottom/livros-1.svg'
import IconLivroDesabilitado from '../../assets/svg/IconsTabBottom/livros-1-desa.svg'

import IconShopAtivo from '../../assets/svg/IconsTabBottom/comprar-1.svg'
import IconShopDesabilitado from '../../assets/svg/IconsTabBottom/frame-6.svg'

import IconCreateAtivo from '../../assets/svg/IconsTabBottom/selecionar 1.svg'
import IconCreateDesabilitado from '../../assets/svg/IconsTabBottom/varinha-magica 1.svg'

import IconTrailAtivo from '../../assets/svg/IconsTabBottom/livroa 1.svg'
import IconTrailDesabilitado from '../../assets/svg/IconsTabBottom/livro 1.svg'

const Tab = createBottomTabNavigator();

function Routes() {

    const { role, loading } = useUserRole();

    if (loading) {
        return null; // or a loading spinner
    }

    const isProfessor = role === "ROLE_INSTRUTOR";  // ← Mude de "professor" para "INSTRUTOR" para corresponder ao valor do backend

    return (
        <Tab.Navigator initialRouteName="home" screenOptions={{
            tabBarActiveTintColor: '#6C63FF',
            tabBarInactiveTintColor: '#676D75',
            headerShown: false,
            tabBarStyle: {
                position: 'absolute',
                backgroundColor: '#1D1F24',
                borderTopWidth: 0,
                bottom: 24,
                marginLeft: 20,
                marginRight: 20,
                elevation: 0,
                borderRadius: 20,
                height: 60
            }

        }}>
            <Tab.Screen name="home" component={Homepage} options={{
                tabBarIcon: ({ color, size, focused }) => {
                    if (focused) {
                        return <IconHomeAtivo />
                    }
                    return <IconHomeDesabilitado />
                }
            }} />
            <Tab.Screen name="Biblioteca" component={BibliotecaCursos} options={{
                tabBarIcon: ({ color, size, focused }) => {
                    if (focused) {
                        return <IconLivroAtivo />
                    }
                    return <IconLivroDesabilitado />
                }
            }} />
            <Tab.Screen name="Shop" component={ShopPage} options={{
                tabBarIcon: ({ color, size, focused }) => {
                    if (focused) {
                        return <IconShopAtivo />
                    }
                    return <IconShopDesabilitado />
                }
            }} />
            <Tab.Screen name="Trilha" component={Trail} options={{
                tabBarIcon: ({ color, size, focused }) => {
                    if (focused) {
                        return <IconTrailAtivo />
                    }
                    return <IconTrailDesabilitado />
                }
            }} />

            {/* Aba só pro professor */}
            {isProfessor && (
                <Tab.Screen name="Minhas Trilhas" component={CriarTrilha} options={{
                    tabBarIcon: ({ color, size, focused }) => {
                        if (focused) {
                            return <IconCreateAtivo />
                        }
                        return <IconCreateDesabilitado />
                    }
                }} />
            )}

        </Tab.Navigator>
    )
}

export default Routes;