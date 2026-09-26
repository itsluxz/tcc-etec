import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, shadow } from '../../theme/colors';

// NOTE: this screen wasn't part of the files shared with me, so it's a
// lightweight scaffold matching the rest of the app's visual style.
// Wire the `handleLogin` function to your real authentication call —
// it currently just navigates straight into the app.
export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleLogin() {
    navigation.replace('Main');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.content}>
          <View style={styles.brand}>
            <Text style={styles.brandTitle}>Escola+</Text>
            <Text style={styles.brandSubtitle}>Acompanhe sua vida escolar em um só lugar</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="seuemail@escola.com"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />

            <Text style={styles.label}>Senha</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              style={styles.input}
            />

            <Pressable style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Entrar</Text>
            </Pressable>

            <Pressable>
              <Text style={styles.forgotText}>Esqueci minha senha</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  brand: {
    marginBottom: spacing.xl,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  brandSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  buttonText: {
    color: colors.textInverse,
    fontSize: 15,
    fontWeight: '700',
  },
  forgotText: {
    textAlign: 'center',
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
