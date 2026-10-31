import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { initials, type Item } from '@borrowcircle/shared';
import { colors, font, radius, shadow, statusColors } from '@/theme';
import { itemImageUrl } from '@/lib/backend';

export type IconName = keyof typeof Ionicons.glyphMap;

export function Icon({ name, size = 22, color = colors.ink }: { name: IconName; size?: number; color?: string }) {
  return <Ionicons name={name} size={size} color={color} />;
}

export function Logo({ inverse = false, size = 'md' }: { inverse?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'lg' ? { box: 44, circle: 30, border: 4, text: 26 } : size === 'sm' ? { box: 26, circle: 17, border: 2.5, text: 15 } : { box: 34, circle: 23, border: 3, text: 19 };
  const ring = inverse ? '#9CC7B9' : colors.forest;
  const ring2 = inverse ? colors.white : colors.deep;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: dims.box, height: dims.box, position: 'relative' }}>
        <View style={{ position: 'absolute', width: dims.circle, height: dims.circle, borderRadius: dims.circle / 2, borderWidth: dims.border, borderColor: ring, top: dims.box * 0.15, left: 0 }} />
        <View style={{ position: 'absolute', width: dims.circle, height: dims.circle, borderRadius: dims.circle / 2, borderWidth: dims.border, borderColor: ring2, top: dims.box * 0.15, right: 0 }} />
      </View>
      <Text style={{ fontFamily: font.displayBold, fontSize: dims.text, letterSpacing: -0.6, color: inverse ? colors.white : colors.deep }}>BorrowCircle</Text>
    </View>
  );
}

export function Button({
  children,
  variant = 'primary',
  onPress,
  disabled,
  style,
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'light' | 'ghost' | 'danger';
  onPress?: () => void;
  disabled?: boolean;
  style?: object;
}) {
  const palette = {
    primary: { bg: colors.forest, fg: colors.white, border: 'transparent' },
    secondary: { bg: colors.white, fg: colors.forestDark, border: colors.border },
    light: { bg: colors.white, fg: colors.deep, border: 'transparent' },
    ghost: { bg: 'transparent', fg: colors.deep, border: 'transparent' },
    danger: { bg: colors.redBg, fg: colors.red, border: 'transparent' },
  }[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: palette.bg,
          borderRadius: radius.button,
          minHeight: 48,
          paddingHorizontal: 20,
          borderWidth: palette.border === 'transparent' ? 0 : 1,
          borderColor: palette.border,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={{ color: palette.fg, fontFamily: font.bodyBold, fontSize: 14 }}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export function Card({ children, style, onPress }: { children: ReactNode; style?: object; onPress?: () => void }) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [{ backgroundColor: colors.white, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }, shadow.floating, pressed && { opacity: 0.92 }, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[{ backgroundColor: colors.white, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }, style]}>{children}</View>;
}

export function StatusPill({ status }: { status: string }) {
  const palette = statusColors[status] ?? { bg: '#F0F2F1', text: colors.muted };
  return (
    <View style={{ backgroundColor: palette.bg, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' }}>
      <Text style={{ color: palette.text, fontFamily: font.bodyBold, fontSize: 9, letterSpacing: 0.5, textTransform: 'uppercase' }}>
        {status.replace(/_/g, ' ').toLowerCase()}
      </Text>
    </View>
  );
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.forestDark, fontFamily: font.bodyBold, fontSize: size * 0.32 }}>{initials(name)}</Text>
    </View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secure,
  multiline,
  keyboardType,
  autoCapitalize = 'sentences',
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  error?: string;
  secure?: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 10, fontFamily: font.bodyBold, textTransform: 'uppercase', letterSpacing: 0.8, color: colors.muted, marginBottom: 7 }}>{label}</Text>
      <View style={{ borderWidth: 1, borderColor: error ? colors.red : colors.border, borderRadius: radius.input, backgroundColor: colors.white, paddingHorizontal: 14, paddingVertical: multiline ? 10 : 0 }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.faint}
          secureTextEntry={secure}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          style={{ minHeight: multiline ? 70 : 48, fontSize: 14, color: colors.ink, fontFamily: font.body }}
        />
      </View>
      {error ? <Text style={{ color: colors.red, fontSize: 11, fontFamily: font.bodySemi, marginTop: 5 }}>{error}</Text> : null}
    </View>
  );
}

export function ItemCard({ item, saved, onSave, onPress, width, style }: { item: Item; saved?: boolean; onSave?: () => void; onPress?: () => void; width?: number; style?: object }) {
  const image = itemImageUrl(item.image_urls?.[0] ?? item.images?.[0]?.storage_path);
  const cardWidth = width;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ width: cardWidth, backgroundColor: colors.white, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }, shadow.floating, pressed && { opacity: 0.92 }, style]}>
      <View>
        <Image source={image ? { uri: image } : undefined} style={{ width: '100%', aspectRatio: 4 / 3, backgroundColor: '#EDF0ED' }} resizeMode="cover" />
        <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: item.status === 'ACTIVE' ? '#29A66F' : colors.gold }} />
          <Text style={{ color: item.status === 'ACTIVE' ? colors.forest : colors.warnText, fontSize: 9, fontFamily: font.bodyBold }}>{item.status === 'ACTIVE' ? 'Available now' : 'Currently out'}</Text>
        </View>
        {onSave && (
          <Pressable onPress={onSave} style={{ position: 'absolute', top: 11, right: 11, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={saved ? 'heart' : 'heart-outline'} size={18} color={saved ? colors.red : colors.ink} />
          </Pressable>
        )}
      </View>
      <View style={{ padding: 14 }}>
        <Text style={{ color: colors.muted, fontSize: 10, marginBottom: 6 }}>{item.category?.name} · {item.location_label ?? 'Nearby'}</Text>
        <Text numberOfLines={1} style={{ fontFamily: font.display, fontSize: 15, color: colors.ink }}>{item.title}</Text>
        <Text style={{ color: colors.faint, fontSize: 10, marginTop: 6 }}>{item.condition} condition</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: colors.deep }}>
            {item.borrowing_fee === 0 ? 'Free' : `₹${Math.round(item.borrowing_fee / 100)}`}
            <Text style={{ fontSize: 10, color: colors.muted, fontFamily: font.bodyMedium }}>/day</Text>
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="star" size={13} color={colors.gold} />
            <Text style={{ fontSize: 11, fontFamily: font.bodyBold, color: colors.ink }}>{item.owner?.rating_avg ? item.owner.rating_avg.toFixed(1) : 'New'}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: IconName; title: string; text: string; action?: ReactNode }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: 30, borderWidth: 1, borderStyle: 'dashed', borderColor: '#CCD6D0', borderRadius: 18, backgroundColor: colors.white, minHeight: 220 }}>
      <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.greenLight, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={26} color={colors.forest} />
      </View>
      <Text style={{ fontFamily: font.display, fontSize: 19, color: colors.deep, marginTop: 18, marginBottom: 6 }}>{title}</Text>
      <Text style={{ color: colors.muted, fontSize: 12, textAlign: 'center', lineHeight: 19 }}>{text}</Text>
      {action && <View style={{ marginTop: 16 }}>{action}</View>}
    </View>
  );
}

export function SectionHeading({ kicker, title, action }: { kicker: string; title: string; action?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.forest, fontFamily: font.bodyBold, textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 10 }}>{kicker}</Text>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: colors.deep, letterSpacing: -0.5, marginTop: 6 }}>{title}</Text>
      </View>
      {action}
    </View>
  );
}

export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', bottom: 100, alignSelf: 'center', backgroundColor: colors.deep, borderRadius: 10, paddingHorizontal: 17, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 9 }}>
      <Ionicons name="checkmark-circle" size={18} color={colors.white} />
      <Text style={{ color: colors.white, fontSize: 12, fontFamily: font.bodySemi }}>{message}</Text>
    </View>
  );
}

export type IoniconName = ComponentProps<typeof Ionicons>['name'];
