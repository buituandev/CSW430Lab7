import { View, StyleSheet, TextInput, TouchableOpacity, Text, Alert } from 'react-native'
import { globalStyle, MAIN_COLOR, MUTED_COLOR } from '../../styles';
import { useState, useEffect } from 'react';
import { addCustomer, editCustomer, getCustomer } from '../services/api'


const AddCustomer = ({ navigation, route }) => {
    const id = route.params?.id;
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [update, setUpdate] = useState(false)

    useEffect(() => {
        fetchUpdate()
    }, [])

    const fetchUpdate = async () => {
        if (!id) {
            return
        }

        try {
            const data = await getCustomer(id);
            setName(data?.name)
            setPhone(data?.phone)
            if (data) {
                setUpdate(true)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const addCus = async () => {
        if (!id) {
            try {
                const res = await addCustomer(name, phone);
                Alert.alert('Success', 'Customer added successfully', [{ text: 'OK' }])
                navigation.navigate('Main', { screen: 'Customer' });
            } catch (error) {
                console.error(error)
            }
        } else {
            try {
                const res = await editCustomer(id, name, phone);
                Alert.alert('Success', 'Customer edited successfully', [{ text: 'OK' }])
                navigation.navigate('CDetail', { 'id': id });
            } catch (error) {
                console.error(error)
            }
        }
    }

    return (<View style={styles.container}>
        <Text style={styles.label}>Customer name *</Text>
        <TextInput
            placeholder='Input your customer name'
            placeholderTextColor={MUTED_COLOR}
            style={globalStyle.input}
            value={name}
            onChangeText={setName}
        />
        <Text style={styles.label}>Phone *</Text>
        <TextInput
            value={phone}
            keyboardType='phone-pad'
            style={globalStyle.input}
            onChangeText={setPhone}
            placeholder='Input a phone number'
            placeholderTextColor={MUTED_COLOR}
        />
        <TouchableOpacity style={[globalStyle.button, { backgroundColor: MAIN_COLOR }]} onPress={addCus}>
            <Text style={globalStyle.buttonText}>{update ? 'Update' : 'Add'}</Text>
        </TouchableOpacity>
    </View>)
}

export default AddCustomer;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 5
    },
    label: {
        fontWeight: 'bold'
    }
})