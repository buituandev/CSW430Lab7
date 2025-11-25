import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native"
import { getCustomer, deleteService, deleteCustomer } from '../services/api'
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu'
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'
import formatVND from "../utils/money"
import { MAIN_COLOR, MUTED_COLOR } from "../../styles"

const CustomerDetail = ({ route, navigation }) => {
    const { id } = route.params;
    const [cus, setCus] = useState({})

    useEffect(() => {
        fetchAService();
    }, [])

    const fetchAService = async () => {
        try {
            const response = await getCustomer(id);
            setCus(response)
        } catch (error) {
            console.error("Error while loading data: ", error)
        }
    }

    const handleEdit = () => {
        navigation.navigate('Addcus', { id: id });
    }

    const handleDelete = () => {
        Alert.alert(
            'Warning',
            'Are you sure you want to remove this customer?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteCustomer(id);
                            Alert.alert('Success', 'Customer deleted successfully');
                            navigation.navigate('Main', { screen: 'Customer' });
                        } catch (error) {
                            console.error('Error deleting customer:', error);
                        }
                    }
                }
            ]
        );
    }

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Menu>
                    <MenuTrigger>
                        <MaterialDesignIcons
                            name="dots-vertical"
                            size={30}
                            color="#fff"
                        />
                    </MenuTrigger>
                    <MenuOptions>
                        <MenuOption onSelect={handleEdit}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}>
                                <Text style={{ marginLeft: 10, fontSize: 16 }}>Edit</Text>
                            </View>
                        </MenuOption>
                        <MenuOption onSelect={handleDelete}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}>
                                <Text style={{ marginLeft: 10, fontSize: 16, color: 'red' }}>Delete</Text>
                            </View>
                        </MenuOption>
                    </MenuOptions>
                </Menu>
            )
        });
    }, [navigation]);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.contentContainer}>
                <Text style={styles.labelMuted}>Information</Text>
                <Text><Text style={styles.label}>Name:</Text> {cus.name}</Text>
                <Text><Text style={styles.label}>Phone:</Text> {cus.phone}</Text>
                <Text><Text style={styles.label}>Total spent:</Text> {cus.totalSpent}</Text>
                <Text><Text style={styles.label}>Time:</Text> {new Date(cus.updatedAt).toLocaleString()}</Text>
                <Text><Text style={styles.label}>Last Update:</Text> {new Date(cus.updatedAt).toLocaleString()}</Text>
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.labelMuted}>Transaction history</Text>
                {cus.transactions?.map((tran) => (
                    <View style={styles.subCon} key={tran._id}>
                        <Text style={styles.label}>{tran.id} - {new Date(tran.updatedAt).toLocaleString()}</Text>
                        <View style={{ flexDirection: "row", justifyContent: 'space-between', alignItems: 'center' }}>
                            <View>
                                {tran.services?.map((ser) => (
                                    <Text key={ser._id}>- {ser.name}</Text>
                                ))}
                            </View>
                            <View>
                                <Text style={{ fontWeight: 'bold', color: MAIN_COLOR }}>{formatVND(tran.price)}</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
    },
    label: {
        fontWeight: 'bold'
    },
    labelMuted: {
        color: MUTED_COLOR,
        fontWeight: 'bold'
    },
    contentContainer: {
        borderRadius: 16,
        padding: 10,
        marginTop: 16,
        backgroundColor: 'white',
    },
    subCon: {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: MUTED_COLOR,
        padding: 10,
        borderRadius: 16,
        marginVertical: 10,
    }
})

export default CustomerDetail;