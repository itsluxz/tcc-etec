import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authenticationApi } from '../../services/endpoints';
import { getApiErrorMessage } from '../../services/errors';
import { primaryButtonStyles } from '../../styles/common';
import { loginColors, loginStyles as styles } from '../../styles/screens/login';

const profiles = {
  ALUNO: 'Aluno',
  PROFESSOR: 'Professor',
  GESTAO: 'Gestão',
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleLogin() {
    if (!email.trim() || !password) {
      setErrorMessage('Preencha o e-mail e a senha.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const { data } = await api.post('/login', { email: email.trim(), senha: password });
      navigation.replace('Main', { profile: profiles[data.tipo] ?? 'Aluno', usuario: data });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível conectar ao servidor.'));
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="light" backgroundColor={loginColors.statusBar} />
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
            <Text style={styles.subtitle}>Use seu e-mail e senha para continuar.</Text>

            <Text style={styles.label}>E-mail institucional</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="seu.nome@escola.edu.br"
              placeholderTextColor={loginColors.placeholder}
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
              placeholderTextColor={loginColors.placeholder}
              secureTextEntry
              style={styles.input}
            />

            <Text style={styles.forgot}>Esqueceu a senha?</Text>

            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

            <Pressable
              style={[primaryButtonStyles.button, styles.loginButton, loading && primaryButtonStyles.disabled]}
              onPress={handleLogin}
              disabled={loading}
              accessibilityRole="button"
              accessibilityState={{ disabled: loading }}
            >
              <Text style={primaryButtonStyles.label}>{loading ? 'Entrando...' : 'Entrar no portal'}</Text>
            </Pressable>

            <Text style={styles.help}>Precisa de ajuda para acessar?</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
