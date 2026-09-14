import React, { useEffect, useState } from 'react';
import { Text, TextInput, Share, View } from 'react-native';
import BottomSheetModal from './BottomSheetModal';
import { SubmitButton, CancelButton } from './FormBits';
import { inviteMember } from '../api/notificationEvents';
import { fetchInviteCode } from '../api/trip';
import { useTheme } from '../theme/ThemeContext';
import { apiError } from '../utils/apiError';

export default function InviteMemberModal({ visible, onClose, tripId, name }: { visible: boolean; onClose: () => void; tripId: string; name: string }) {
    const { colors } = useTheme();
    const [email, setEmail] = useState(''), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
    useEffect(() => { if (visible) { setEmail(''); setMessage(''); } }, [visible]);
    async function run(action: () => Promise<void>) {
        if (busy) return; setBusy(true); setMessage('');
        try { await action(); } catch (error) { setMessage(apiError(error)); } finally { setBusy(false); }
    }
    return <BottomSheetModal visible={visible} onClose={onClose} title="여행에 초대하기" >
        <View style={{ gap: 12 }}>
            <Text style={{ color: colors.txSecondary }}> 방장이 가입된 사용자의 이메일로 초대하면, 상대방의 알림함에서 수락할 수 있어요.초대는 7일 동안 유효해요.</Text>
            < TextInput value={email} onChangeText={setEmail} editable={!busy
            } autoCapitalize="none" keyboardType="email-address" placeholder="초대할 계정 이메일" placeholderTextColor={colors.txMuted} style={{ color: colors.txPrimary, borderWidth: 1, borderColor: colors.bdCard, padding: 12, borderRadius: 10 }} />
            {message ? <Text accessibilityLiveRegion="polite" style={{ color: colors.txSecondary }}> {message} </Text> : null}
            <SubmitButton label={busy ? '처리 중…' : '초대 보내기'} onPress={() => run(async () => { await inviteMember(tripId, email.trim()); setMessage('초대를 보냈어요. 상대방의 알림함에서 확인할 수 있어요.'); })} />
            < SubmitButton label="초대 코드 공유" onPress={() => run(async () => { const code = await fetchInviteCode(tripId); await Share.share({ message: name + ' 초대 코드: ' + code }); })} />
            < CancelButton onPress={onClose} />
        </View>
    </BottomSheetModal>;
}