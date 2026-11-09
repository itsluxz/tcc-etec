import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import EloTabBar from '../../components/EloTabBar';
import { contentTopStyle } from '../../styles/common';
import { boletimColors, boletimStyles as styles } from '../../styles/screens/boletim';

export default function BoletimScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, contentTopStyle(insets.top)]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brand}>
            <Text style={styles.logoText}>elo</Text>
          </View>
          <View style={styles.notification}>
            <Text style={styles.bell}>🔔</Text>
            <View style={styles.notificationDot} />
          </View>
        </View>

        <Text style={styles.title}>Student Grades</Text>
        <Text style={styles.subtitle}>Consulta de notas e rendimento</Text>

        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar aluno ou matrícula"
            placeholderTextColor={boletimColors.muted}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={[styles.stateCard, styles.errorCard]}>
          <Text style={styles.errorTitle}>Dados indisponíveis</Text>
          <Text style={styles.stateText}>
            O backend atual não possui uma rota de consulta de notas. Nenhum endpoint foi presumido ou chamado.
          </Text>
        </View>
      </ScrollView>

      <EloTabBar active="Boletim" navigation={navigation} />
    </SafeAreaView>
  );
}
