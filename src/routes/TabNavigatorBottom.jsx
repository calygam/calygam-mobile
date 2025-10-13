import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Homepage from "../screens/HomePage/Homepage";
import BibliotecaCursos from "../screens/PageBiblioteca/BibliotecaCursos";
import ShopPage from "../screens/ShopPage/ShopPage";

// Icon Tab Naviagtion
import IconHomeAtivo from '../../assets/svg/IconsTabBottom/group-1.svg'
import IconHomeDesabilitado from '../../assets/svg/IconsTabBottom/casa-1-2.svg'

import IconLivroAtivo from '../../assets/svg/IconsTabBottom/livros-1.svg'
import IconLivroDesabilitado from '../../assets/svg/IconsTabBottom/livros-1-desa.svg'

import IconShopAtivo from '../../assets/svg/IconsTabBottom/comprar-1.svg'
import IconShopDesabilitado from '../../assets/svg/IconsTabBottom/frame-6.svg'

const Tab = createBottomTabNavigator();

function Routes(){
    return(
        <Tab.Navigator initialRouteName="Home" screenOptions={{
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
            <Tab.Screen name="Home" component={Homepage} options={{
                tabBarIcon: ({color, size, focused}) => {
                    if(focused){
                        return <IconHomeAtivo />
                    }
                    return <IconHomeDesabilitado />
                }
            }}/>
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
        </Tab.Navigator>
    )
}

export default Routes;