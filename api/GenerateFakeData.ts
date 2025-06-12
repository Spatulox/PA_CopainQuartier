import {faker } from "@faker-js/faker"
import { UserTable } from "./src/DB_Schema/UserSchema";
import { TrocTable } from "./src/DB_Schema/TrocSchema";
import { PublicationTable } from "./src/DB_Schema/PublicationSchema";
import { ChannelTable } from "./src/DB_Schema/ChannelSchema";
import { ActivityTable } from "./src/DB_Schema/ActivitiesSchema";
import { User as UserModel } from "./src/Models/UserModel";
import { Channel as ChannelModel} from './src/Models/ChannelModel'
import { Troc as TrocModel } from "./src/Models/TrocModel";
import { Publication as PublicationModel} from './src/Models/PublicationModel'
import { Activity as ActivityModel } from './src/Models/ActivityModel'

import { closeDB, connectDB } from "./src/DB_Schema/connexion";
import { hashPassword } from "./src/Services/auth/password";

export async function GenerateFakeData(){
    await connectDB()
    console.log("Generating fake data")
    const users = await FakeUser()
    console.log("Users generated...")

    const channels = await FakeChannel(users)
    console.log("Channels generated...")

    // Update the user part to reflect the channels
    await UpdateUserChannel(channels)
    console.log("Users and Channels linked...")

    const trocs = await FakeTroc(users)
    console.log("Trocs generated...")

    await UpdateUserTrocs(trocs)
    console.log("User and Trocs linked...")

    const publications = await FakePublication(users)
    console.log("Publications generated...")

    const activities = await FakeActivity(users, channels, publications)
    console.log("Activity generated...")

    await UpdateActivityPublicationChannelLink(activities, publications, channels)
    console.log("Publication, activity and channels linked...")
    
    closeDB()
}

GenerateFakeData()

async function FakeUser(){
    const users = [];

    const user = new UserTable({
        name: faker.person.firstName(),
        lastname: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        verified: faker.datatype.boolean(),
        role: 'admin',
        group_chat_list_ids: [], // Nous le laisserons vide pour l'instant
        troc_score: faker.helpers.maybe(() => faker.number.int({ min: 0, max: 100 }).toString(), { probability: 0.7 }),
        password: await hashPassword(faker.internet.password()),
    });

    const savedUser = await user.save();
    users.push(savedUser);

    for (let i = 0; i < 10; i++) {
        const user = new UserTable({
            name: faker.person.firstName(),
            lastname: faker.person.lastName(),
            email: faker.internet.email(),
            address: faker.location.streetAddress(),
            verified: faker.datatype.boolean(),
            role: 'member',
            group_chat_list_ids: [], // Nous le laisserons vide pour l'instant
            troc_score: faker.helpers.maybe(() => faker.number.int({ min: 0, max: 100 }).toString(), { probability: 0.7 }),
            password: await hashPassword(faker.internet.password()),
            phone: faker.phone.number(),
        });

        const savedUser = await user.save();
        users.push(savedUser);
    }

    return users;
}

async function FakeTroc(users: UserModel[]) {
    let lesTrocs = []
    for (let i = 0; i < 20; i++) {
        const troc = new TrocTable({
            title: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            author_id: faker.helpers.arrayElement(users)._id,
            status: faker.helpers.arrayElement(['pending', 'completed', 'cancelled']),
            type: faker.helpers.arrayElement(['item', 'service',]),
            created_at: faker.date.past(),
            reserved_at: faker.date.recent(),
            reserved_by: faker.helpers.arrayElement(users)._id
        });
        await troc.save();
        lesTrocs.push(troc)
    }
    return lesTrocs
}


async function FakePublication(users: UserModel[]) {
    let publications = [];
    for (let i = 0; i < 30; i++) {
        const publication = new PublicationTable({
            name: faker.lorem.sentence(),
            description: faker.lorem.sentence(),
            body: faker.lorem.paragraphs(),
            author_id: faker.helpers.arrayElement(users)._id,
            created_at: faker.date.past(),
            updated_at: faker.date.recent(),
        });
        await publication.save();
        publications.push(publication);
    }
    return publications;
}

async function FakeChannel(users: UserModel[]) {
    const channels = [];
    for (let i = 0; i < 5; i++) {
        const author = faker.helpers.arrayElement(users)._id
        let members = faker.helpers.arrayElements(users.map(user => user._id), { min: 2, max: users.length })
        if(!members.includes(author)){
            members.push(author)
        }
        const channel = new ChannelTable({
            name: faker.word.noun() + " Channel",
            type: faker.helpers.arrayElement(['text', 'vocal']),
            description: faker.lorem.sentence(),
            admin_id: author,
            message: [],
            members: members,
            created_at: faker.date.past(),
            member_auth: faker.helpers.arrayElement(['read_send', 'read_only'])
        });
        const savedChannel = await channel.save();
        channels.push(savedChannel);
    }
    return channels;
}

async function FakeActivity(users: UserModel[], channels: ChannelModel[], publication: PublicationModel[]) {
    let activities = []
    for (let i = 0; i < 50; i++) {
        let author = faker.helpers.arrayElement(users)._id
        let members = faker.helpers.arrayElements(users.map(user => user._id), { min: 2, max: users.length })
        if(!members.includes(author)){
            members.push(author)
        }
        let chatId = faker.helpers.arrayElement(channels)._id
        let publicationId = faker.helpers.arrayElement(publication)._id
        const activity = new ActivityTable({
            title: faker.word.noun() + " Activity",
            description: faker.lorem.sentence(),
            created_at: faker.date.past(),
            date_reservation: faker.date.future(),
            author_id: author,
            channel_chat_id: chatId,
            publication_id: publicationId,
            participants_id: members,
            max_place: faker.number.int({ min: members.length, max: 20 }),
            reserved_place: members.length,
            location: faker.location.city(),
        });
        await activity.save();
        activities.push(activity)
    }
    return activities
}


async function UpdateUserChannel(channels: ChannelModel[]) {

    for (const channel of channels) {
        const channelId = channel._id;

        for (const memberId of channel.members) {
            const user = await UserTable.findById(memberId);

            if (user) {
                if (!user.group_chat_list_ids.includes(channelId)) {
                    user.group_chat_list_ids.push(channelId);
                    await user.save();
                }
            }
        }
    }

    console.log("Users updated with group_chat_list_ids!");
}

async function UpdateUserTrocs(trocs: TrocModel[]) {
    const userTrocs = new Map();

    for (const troc of trocs) {
        if (!userTrocs.has(troc.author_id.toString())) {
            userTrocs.set(troc.author_id.toString(), { created: [], reserved: [] });
        }
        userTrocs.get(troc.author_id.toString()).created.push(troc._id);

        if(!troc.reserved_by) {
            continue; 
        }
        if (!userTrocs.has(troc.reserved_by.toString())) {
            userTrocs.set(troc.reserved_by.toString(), { created: [], reserved: [] });
        }
        userTrocs.get(troc.reserved_by.toString()).reserved.push(troc._id);
    }

    for (const [userId, userTrocData] of userTrocs) {
        await UserTable.findByIdAndUpdate(userId, {
            $push: {
                trocs_created: { $each: userTrocData.created },
                trocs_reserved: { $each: userTrocData.reserved }
            }
        });
    }
}

async function UpdateActivityPublicationChannelLink(
    activities: ActivityModel[],
    publications: PublicationModel[],
    channels: ChannelModel[]
) {
    // Créer une copie des publications pour pouvoir les retirer au fur et à mesure
    let availablePublications = [...publications];
    let availableChannels = [...channels];

    for (const activity of activities) {
        // Associer une publication si disponible
        if (availablePublications.length > 0) {
            const randomIndex = Math.floor(Math.random() * availablePublications.length);
            const publication = availablePublications[randomIndex];

            // Mettre à jour l'activité avec l'ID de la publication
            await ActivityTable.findByIdAndUpdate(activity._id, {
                publication_id: publication._id
            });

            // Mettre à jour la publication avec l'ID de l'activité
            await PublicationTable.findByIdAndUpdate(publication._id, {
                activity_id: activity._id
            });

            // Retirer la publication utilisée de la liste des disponibles
            availablePublications.splice(randomIndex, 1);
        }

        // Associer un channel obligatoirement
        if (availableChannels.length > 0) {
            const randomChannel = faker.helpers.arrayElement(availableChannels);

            // Mettre à jour l'activité avec l'ID du channel
            await ActivityTable.findByIdAndUpdate(activity._id, {
                channel_chat_id: randomChannel._id
            });
        } else {
            throw new Error("Pas assez de channels disponibles pour associer toutes les activités.");
        }
    }
}
