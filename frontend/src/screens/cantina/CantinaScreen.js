import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import { colors, radius, spacing } from '../../theme/colors';
import { lunch } from '../../data/mockData';

export default function LunchScreen() {
  const [vaiAlmocar, definirPresenca] = useState(null);

  return (
    <SafeAreaView style={estilos.areaSegura} edges={['top']}>
      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <Text style={estilos.titulo}>Almoço</Text>
        <Text style={estilos.subtitulo}>{lunch.dateLabel}</Text>

        <Card style={estilos.cartaoConfirmacao}>
          <Text style={estilos.tituloConfirmacao}>Você vai almoçar hoje?</Text>
          <Text style={estilos.subtituloConfirmacao}>Confirme até as 9h para a cozinha se organizar.</Text>

          <View style={estilos.linhaBotoes}>
            <Pressable
              style={[ estilos.botao, estilos.botaoSim, vaiAlmocar === true && estilos.botaoSimAtivo]}
              onPress={() => definirPresenca(true)}
            >
              <Ionicons
                name="checkmark"
                size={16}
                color={vaiAlmocar === true ? colors.textInverse : colors.success}
              />
              <Text style={[estilos.textoBotao, { color: vaiAlmocar === true ? colors.textInverse : colors.success }]}>
                {' '}Sim, vou
              </Text>
            </Pressable>

            <Pressable
              style={[estilos.botao, estilos.botaoNao, vaiAlmocar === false && estilos.botaoNaoAtivo]}
              onPress={() => definirPresenca(false)}
            >
              <Ionicons
                name="close"
                size={16}
                color={vaiAlmocar === false ? colors.textInverse : colors.danger}
              />
              <Text style={[estilos.textoBotao, { color: vaiAlmocar === false ? colors.textInverse : colors.danger }]}>
                {' '}Não vou
              </Text>
            </Pressable>
          </View>

          <Text style={estilos.textoAjuda}>
            {vaiAlmocar === null
              ? 'Toque para confirmar sua presença.'
              : vaiAlmocar
              ? 'Presença confirmada. Bom apetite! 🍽️'
              : 'Ausência registrada para hoje.'}
          </Text>
        </Card>

        <Text style={estilos.tituloSecao}>Cardápio do dia</Text>

        <Card>
          {lunch.menu.map((item, indice) => (
            <View
              key={item.id}
              style={[estilos.linhaCardapio, indice < lunch.menu.length - 1 && estilos.divisorCardapio]}
            >
              <View style={estilos.areaIconeCardapio}>
                <Text style={estilos.iconeCardapio}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={estilos.rotuloCardapio}>{item.label.toUpperCase()}</Text>
                <Text style={estilos.valorCardapio}>{item.value}</Text>
              </View>
            </View>
          ))}
        </Card>

        <View style={estilos.linhaObservacao}>
          <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
          <Text style={estilos.textoObservacao}>{lunch.vegetarianNote}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  areaSegura: {
    flex: 1,
    backgroundColor: colors.background,
  },
  conteudo: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitulo: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  cartaoConfirmacao: {
    marginBottom: spacing.lg,
  },
  tituloConfirmacao: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtituloConfirmacao: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  linhaBotoes: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  botao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  botaoSim: {
    borderColor: colors.success,
    backgroundColor: colors.tagGreen,
  },
  botaoSimAtivo: {
    backgroundColor: colors.success,
  },
  botaoNao: {
    borderColor: colors.danger,
    backgroundColor: '#FCEAEA',
  },
  botaoNaoAtivo: {
    backgroundColor: colors.danger,
  },
  textoBotao: {
    fontSize: 14,
    fontWeight: '700',
  },
  textoAjuda: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  tituloSecao: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  linhaCardapio: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  divisorCardapio: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  areaIconeCardapio: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  iconeCardapio: {
    fontSize: 18,
  },
  rotuloCardapio: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  valorCardapio: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  linhaObservacao: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  textoObservacao: {
    flex: 1,
    fontSize: 12,
    color: colors.primary,
  },
});
