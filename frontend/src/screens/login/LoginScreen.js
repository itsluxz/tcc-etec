import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

const blue = '#3264F5';
const ink = '#172441';
const muted = '#71809B';

export default function LoginScreen({ navigation }) {
  const [profile, setProfile] = useState('Aluno');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleLogin() {
    navigation.replace('Main');
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="light" backgroundColor="#173A9B" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image source={require('../../../assets/elo-header-gradient.png')} style={styles.gradient} resizeMode="stretch" />
            <Image source={require('../../../assets/elo-header-circle-right.png')} style={styles.circleRight} />
            <Image source={require('../../../assets/elo-header-circle-left.png')} style={styles.circleLeft} />
            <Image source={require('../../../assets/elo-header-curve.png')} style={styles.curve} resizeMode="stretch" />

            <View style={styles.brand}>
              <Image source={require('../../../assets/elo-logo-mark.png')} style={styles.logoMark} />
              <Image source={require('../../../assets/elo-logo-detail.png')} style={styles.logoDetail} />
              <Text style={styles.logoText}>elo</Text>
            </View>

            <Text style={styles.headline}>A escola perto{'\n'}de você.</Text>
            <Text style={styles.headerSubtitle}>Avisos, rotina e recursos em{'\n'}um só lugar.</Text>
          </View>

          <View style={styles.panel}>
            <Text style={styles.title}>Entrar no elo</Text>
            <Text style={styles.subtitle}>Escolha seu perfil para continuar.</Text>

            <View style={styles.profiles}>
              {['Aluno', 'Professor', 'Gestão'].map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setProfile(item)}
                  style={[styles.profile, profile === item && styles.profileSelected]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: profile === item }}
                >
                  <Text style={[styles.profileText, profile === item && styles.profileTextSelected]}>{item}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>E-mail institucional</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="seu.nome@escola.edu.br"
              placeholderTextColor="#AAB5C8"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              style={styles.input}
            />

            <Text style={styles.label}>Senha</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••••"
              placeholderTextColor="#AAB5C8"
              secureTextEntry
              style={styles.input}
            />

            <Text style={styles.forgot}>Esqueceu a senha?</Text>

            <Pressable style={styles.button} onPress={handleLogin} accessibilityRole="button">
              <Text style={styles.buttonText}>Entrar no portal</Text>
            </Pressable>

            <Text style={styles.help}>Precisa de ajuda para acessar?</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#173A9B' },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, backgroundColor: '#FFFFFF' },
  header: { height: 301, overflow: 'hidden', backgroundColor: '#173A9B' },
  gradient: { position: 'absolute', top: -24, left: 0, width: '100%', height: 350 },
  circleRight: { position: 'absolute', top: -86, right: -63, width: 236, height: 236 },
  circleLeft: { position: 'absolute', top: 221, left: -47, width: 180, height: 180 },
  curve: { position: 'absolute', top: 79, left: -30, width: 427, height: 198 },
  brand: { flexDirection: 'row', alignItems: 'center', marginTop: 35, marginLeft: 27 },
  logoMark: { width: 22, height: 22 },
  logoDetail: { position: 'absolute', left: 6, top: 8, width: 13, height: 8 },
  logoText: { marginLeft: 9, color: '#FFFFFF', fontSize: 23, fontWeight: '700' },
  headline: { marginTop: 42, marginLeft: 28, color: '#FFFFFF', fontSize: 31, lineHeight: 37, fontWeight: '700' },
  headerSubtitle: { marginTop: 10, marginLeft: 28, color: '#DFE8FF', fontSize: 14, lineHeight: 22 },
  panel: {
    flexGrow: 1,
    marginTop: -1,
    paddingTop: 20,
    paddingHorizontal: 26,
    paddingBottom: 34,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: '#FFFFFF',
  },
  title: { color: ink, fontSize: 22, fontWeight: '700', lineHeight: 27 },
  subtitle: { marginTop: 4, color: muted, fontSize: 12, lineHeight: 15 },
  profiles: { flexDirection: 'row', gap: 10, marginTop: 19, marginBottom: 26 },
  profile: { flex: 1, height: 43, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E4EBF5', borderRadius: 11 },
  profileSelected: { borderColor: blue, backgroundColor: '#E8EDFF' },
  profileText: { color: ink, fontSize: 12, fontWeight: '700' },
  profileTextSelected: { color: blue },
  label: { marginBottom: 8, color: ink, fontSize: 11, fontWeight: '700' },
  input: { height: 49, marginBottom: 20, paddingHorizontal: 14, borderWidth: 1, borderColor: '#E4EBF5', borderRadius: 11, color: ink, fontSize: 13 },
  forgot: { alignSelf: 'flex-end', marginTop: -9, color: blue, fontSize: 11, fontWeight: '700' },
  button: { height: 48, marginTop: 23, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: blue },
  buttonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  help: { marginTop: 24, color: muted, fontSize: 12, fontWeight: '700', textAlign: 'center' },
});
