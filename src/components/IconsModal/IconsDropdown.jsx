import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { iconMap } from './Icons';

// Inline dropdown to select an icon in a grid, anchored under the trigger button
export default function IconsDropdown({ selectedKey, onSelect }) {
  const [open, setOpen] = useState(false);

  const items = useMemo(() => {
    // Order a curated list if available, else use all keys from iconMap
    const preferredOrder = ['figma', 'react', 'banco', 'illustrator', 'iot', 'codigo'];
    const available = preferredOrder.filter((k) => !!iconMap[k]);
    const rest = Object.keys(iconMap).filter((k) => !available.includes(k));
    return [...available, ...rest];
  }, []);

  const SelectedIcon = selectedKey && iconMap[selectedKey] ? iconMap[selectedKey] : null;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.8}
        style={styles.trigger}
      >
        {SelectedIcon ? (
          <SelectedIcon width={22} height={22} />
        ) : (
          <Text style={styles.chevron}>Icon</Text>
        )}
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          <View style={styles.grid}>
            {items.map((key) => {
              const Icon = iconMap[key];
              if (!Icon) return null;
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.iconBtn}
                  onPress={() => {
                    onSelect?.(key);
                    setOpen(false);
                  }}
                >
                  <Icon width={28} height={28} />
                  <Text style={styles.iconLabel} numberOfLines={1}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignSelf: 'flex-start'
  },
  trigger: {
    width: 'auto',
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    padding: 12
  },
  chevron: {
    color: '#ffffffff',
    fontSize: 14,
    lineHeight: 10,
  },
  dropdown: {
    position: 'absolute',
    top: 56,
    left: 0,
    backgroundColor: '#E5E5E5',
    borderRadius: 10,
    padding: 1,
    zIndex: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#CFCFCF',
    width: 250,
    paddingTop: 15,
    paddingBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    
  },
  iconBtn: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  iconLabel: {
    marginTop: 4,
    fontSize: 10,
    color: '#444'
  }
});
