import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { selectColors, selectStyles as styles } from '../styles/components';

// campo de seleção: toca para abrir a lista e escolhe uma opção
// options: [{ value, label }]
// uma opção: value + onChange(valor)
// várias opções (multiple): values + onChange([valores]), com "Selecionar todos"
export default function Select({
  options,
  value,
  values = [],
  onChange,
  multiple = false,
  placeholder = 'Selecione',
  emptyText = 'Nenhuma opção disponível.',
  disabled = false,
}) {
  const [open, setOpen] = useState(false);

  const selecionadas = multiple
    ? options.filter((option) => values.includes(option.value))
    : options.filter((option) => option.value === value);

  const resumo =
    selecionadas.length === 0
      ? placeholder
      : selecionadas.length === 1
        ? selecionadas[0].label
        : `${selecionadas.length} selecionados`;

  const todasMarcadas = multiple && options.length > 0 && selecionadas.length === options.length;

  function choose(optionValue) {
    if (!multiple) {
      onChange(optionValue);
      setOpen(false);
      return;
    }

    onChange(values.includes(optionValue) ? values.filter((item) => item !== optionValue) : [...values, optionValue]);
  }

  function toggleTodos() {
    onChange(todasMarcadas ? [] : options.map((option) => option.value));
  }

  return (
    <View>
      <Pressable
        style={[styles.field, open && styles.fieldOpen, disabled && styles.fieldDisabled]}
        onPress={() => setOpen(!open)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ expanded: open, disabled }}
      >
        <Text style={[styles.fieldText, selecionadas.length === 0 && styles.placeholder]} numberOfLines={1}>
          {resumo}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={selectColors.muted} />
      </Pressable>

      {open && (
        <View style={styles.list}>
          {options.length === 0 ? (
            <Text style={styles.empty}>{emptyText}</Text>
          ) : (
            <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
              {multiple && (
                <Pressable style={[styles.item, styles.itemAll]} onPress={toggleTodos} accessibilityRole="button">
                  <Text style={styles.itemAllText}>{todasMarcadas ? 'Desmarcar todos' : 'Selecionar todos'}</Text>
                </Pressable>
              )}
              {options.map((option) => {
                const selected = multiple ? values.includes(option.value) : option.value === value;
                return (
                  <Pressable
                    key={String(option.value)}
                    style={[styles.item, selected && styles.itemSelected]}
                    onPress={() => choose(option.value)}
                    accessibilityRole={multiple ? 'checkbox' : 'button'}
                    accessibilityState={multiple ? { checked: selected } : { selected }}
                  >
                    <Text style={[styles.itemText, selected && styles.itemTextSelected]}>{option.label}</Text>
                    {multiple ? (
                      <Ionicons
                        name={selected ? 'checkbox' : 'square-outline'}
                        size={18}
                        color={selected ? selectColors.primary : selectColors.muted}
                      />
                    ) : selected ? (
                      <Ionicons name="checkmark" size={18} color={selectColors.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
          {multiple && options.length > 0 && (
            <Pressable style={styles.done} onPress={() => setOpen(false)} accessibilityRole="button">
              <Text style={styles.doneText}>Pronto</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
