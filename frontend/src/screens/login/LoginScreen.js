import {
    View,
    Text,
    TouchableOpacity, 

} from 'react-native';

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function LoginScreen() {
    return (
        <SafeAreaProvider>
            <View>
                <Text> Olá mundo! </Text>
            </View>
        </SafeAreaProvider>
    )
}