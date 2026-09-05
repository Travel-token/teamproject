import React, { useEffect, useState } from 'react';
import { Image, ImageProps, Platform, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, apiImageUrl } from '../config/api';
import { api } from '../api/client';
export default function ApiImage({ uri, ...props }: Omit<ImageProps, 'source'> & {
    uri: string;
}) {
    const [source, setSource] = useState<ImageProps['source']>(undefined);
    useEffect(() => {
        let alive = true, objectUrl: string | undefined;
        setSource(undefined);
        (async () => {
            const url = apiImageUrl(uri);
            const own = url.startsWith(API_BASE_URL + '/');
            if (!own) {
                if (alive)
                    setSource({ uri: url });
                return;
            }
            if (Platform.OS === 'web') {
                const res = await api.get<Blob>(url, { responseType: 'blob' });
                objectUrl = URL.createObjectURL(res.data);
                if (alive)
                    setSource({ uri: objectUrl });
                else
                    URL.revokeObjectURL(objectUrl);
            }
            else {
                const token = await AsyncStorage.getItem('accessToken');
                if (alive)
                    setSource({ uri: url, headers: token ? { Authorization: 'Bearer ' + token } : {} });
            }
        })().catch(() => { });
        return () => {
            alive = false;
            if (objectUrl)
                URL.revokeObjectURL(objectUrl);
        };
    }, [uri]);
    return source ? <Image {...props} source={source}/> : <View style={props.style}/>;
}
