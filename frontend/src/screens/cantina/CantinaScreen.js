import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import EloTabBar from '../../components/EloTabBar';
import { cardapiosApi } from '../../services/endpoints';
import { getApiErrorMessage } from '../../services/errors';
import { contentTopStyle } from '../../styles/common';
import { cantinaColors, cantinaStyles as styles, createMenuDotStyle } from '../../styles/screens/cantina';

function parseDate(date) {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatMenuDate(date, options) {
  const parsed = parseDate(date);
  return parsed ? new Intl.DateTimeFormat('pt-BR', options).format(parsed) : date;
}

export default function CantinaScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [menus, setMenus] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadMenus() {
        setStatus('loading');
        setErrorMessage('');

        try {
          const { data } = await cardapiosApi.list();
          if (!Array.isArray(data)) throw new Error('A resposta de cardápios está em um formato inválido.');

          const availableMenus = data
            .filter((item) => typeof item?.data === 'string' && parseDate(item.data))
            .sort((first, second) => first.data.localeCompare(second.data));

          if (!active) return;
          setMenus(availableMenus);
          setSelectedDate((currentDate) => {
            if (availableMenus.some((item) => item.data === currentDate)) return currentDate;
            const today = new Date();
            const todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            return availableMenus.some((item) => item.data === todayDate)
              ? todayDate
              : availableMenus[0]?.data ?? '';
          });
          setStatus(availableMenus.length ? 'success' : 'empty');
        } catch (error) {
          if (!active) return;
          setMenus([]);
          setStatus('error');
          setErrorMessage(getApiErrorMessage(error, 'Não foi possível carregar os cardápios.'));
        }
      }

      loadMenus();
      return () => {
        active = false;
      };
    }, []),
  );

  const days = menus.slice(0, 5);
  const selectedMenu = menus.find((item) => item.data === selectedDate);
  const weekTitle = days.length ? 'Datas cadastradas' : 'Datas disponíveis na API';
  const selectedWeekday = selectedMenu
    ? formatMenuDate(selectedMenu.data, { weekday: 'long' }).toLocaleUpperCase('pt-BR')
    : '';

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, contentTopStyle(insets.top)]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image source={require('../../../assets/elo-home-logo-mark.png')} style={styles.logoMark} />
            <Image source={require('../../../assets/elo-home-logo-eye.png')} style={styles.logoEye} />
            <Text style={styles.logoText}>elo</Text>
          </View>
          <View style={styles.notification}>
            <Image source={require('../../../assets/elo-home-bell.png')} style={styles.bell} />
            <View style={styles.notificationDot} />
          </View>
        </View>

        <Text style={styles.title}>Cardápio</Text>
        <Text style={styles.subtitle}>Cardápios publicados pela escola</Text>

        <View style={styles.weekHeader}>
          <Text style={styles.weekTitle}>{weekTitle}</Text>
          <Text style={styles.weekArrow}>‹</Text>
        </View>

        <View style={styles.days}>
          {days.map((day) => {
            const selected = day.data === selectedDate;
            return (
              <Pressable
                key={day.id ?? day.data}
                style={[styles.day, selected && styles.selectedDay]}
                onPress={() => setSelectedDate(day.data)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.dayName, selected && styles.selectedDayText]}>
                  {formatMenuDate(day.data, { weekday: 'short' }).replace('.', '').toLocaleUpperCase('pt-BR')}
                </Text>
                <Text style={[styles.dayDate, selected && styles.selectedDayText]}>
                  {formatMenuDate(day.data, { day: '2-digit' })}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.menuCard}>
          {status === 'loading' ? (
            <View style={styles.stateCard}>
              <ActivityIndicator size="small" color={cantinaColors.blue} />
              <Text style={styles.stateText}>Carregando cardápios...</Text>
            </View>
          ) : status === 'error' ? (
            <Text style={styles.stateText}>{errorMessage}</Text>
          ) : status === 'empty' ? (
            <Text style={styles.stateText}>Nenhum cardápio foi cadastrado na API.</Text>
          ) : selectedMenu ? (
            <>
              <View style={styles.menuHeading}>
                <View style={styles.mealIconOuter}>
                  <View style={styles.mealIconInner}>
                    <Image source={require('../../../assets/elo-home-meal.png')} style={styles.mealIcon} />
                  </View>
                </View>
                <View style={styles.menuHeadingCopy}>
                  <Text style={styles.weekday}>{selectedWeekday}</Text>
                  <Text style={styles.mealTitle}>{selectedMenu.titulo ?? 'Cardápio'}</Text>
                  <Text style={styles.mealTime}>{formatMenuDate(selectedMenu.data, { dateStyle: 'long' })}</Text>
                </View>
              </View>

              <View style={styles.menuItems}>
                <View style={styles.menuItem}>
                  <View style={[styles.itemDot, createMenuDotStyle(cantinaColors.green)]} />
                  <View style={styles.menuDescription}>
                    <Text style={styles.itemLabel}>DESCRIÇÃO</Text>
                    <Text style={styles.itemValue}>{selectedMenu.descricao}</Text>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.stateText}>Não há um cardápio para a data selecionada.</Text>
          )}
        </View>

        <View style={styles.allergyCard}>
          <Text style={styles.allergyTitle}>Informações sobre alergênicos</Text>
          <Text style={styles.allergyNote}>
            A API de cardápios não disponibiliza dados de alergênicos.
          </Text>
        </View>

        <Text style={styles.footnote}>As datas e descrições são carregadas da API da escola.</Text>
      </ScrollView>
      <EloTabBar active="Merenda" navigation={navigation} />
    </SafeAreaView>
  );
}
