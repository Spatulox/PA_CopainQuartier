import {faker } from "@faker-js/faker"
import { UserRepository } from "./src/db/UserSchema";
import { TrocRepository } from "./src/db/TrocSchema";
import { PublicationRepository } from "./src/db/PublicationSchema";
import { ChannelRepository } from "./src/db/ChannelSchema";
import { ActivityRepository } from "./src/db/ActivitiesSchema";
import { User as UserModel } from "./src/User/UserModel";
import { Channel as ChannelModel} from './src/Channel/ChannelModel'
import { Troc as TrocModel } from "./src/Troc/TrocModel";
import { Publication as PublicationModel} from './src/Publication/PublicationModel'
import { Activity as ActivityModel} from './src/Activity/ActivityModel'

import { mongoose } from "./src/connexion";

export async function GenerateFakeData(){
    console.log("Generating fake data")
    const users = await FakeUser()
    console.log("Users generated...")

    const channels = await FakeChannel(users)
    console.log("Channels generated...")

    const activities = await FakeActivity(users, channels)
    console.log("Activity generated...")

    console.log(users)
    
    const trocs = await FakeTroc(users)
    console.log("Trocs generated...")
    
    FakePublication(users, activities, trocs)
    console.log("Publications generated...")
    
    mongoose.connection.close()
}

GenerateFakeData()

async function FakeUser(){
    const users = [];

    for (let i = 0; i < 10; i++) {
        const user = new UserRepository({
            name: faker.person.firstName(),
            lastname: faker.person.lastName(),
            email: faker.internet.email(),
            address: faker.location.streetAddress(),
            verified: faker.datatype.boolean(),
            role: faker.helpers.arrayElement(['admin', 'member']),
            group_chat_list_ids: [], // Nous le laisserons vide pour l'instant
            troc_score: faker.helpers.maybe(() => faker.number.int({ min: 0, max: 100 }).toString(), { probability: 0.7 }),
            phone: faker.phone.number(),
        });

        const savedUser = await user.save();
        users.push(savedUser);
    }

    console.log(users)

    return users;
}

async function FakeTroc(users: UserModel[]) {
    let lesTrocs = []
    for (let i = 0; i < 20; i++) {
        const troc = new TrocRepository({
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

async function FakePublication(users: UserModel[], activities: ActivityModel[], troc: TrocModel[]) {
    for (let i = 0; i < 30; i++) {
        const publication = new PublicationRepository({
            name: faker.lorem.sentence(),
            body: faker.lorem.paragraphs(),
            author_id: faker.helpers.arrayElement(users)._id,
            created_at: faker.date.past(),
            updated_at: faker.date.recent(),
            activity_id: faker.helpers.arrayElement(activities)._id,
            troc_id: faker.helpers.arrayElement(troc)._id,
        });
        await publication.save();
    }
}

async function FakeChannel(users: UserModel[]) {
    const channels = [];
    for (let i = 0; i < 5; i++) {
        const author = faker.helpers.arrayElement(users)._id
        let members = faker.helpers.arrayElements(users.map(user => user._id), { min: 2, max: users.length })
        if(!members.includes(author)){
            members.push(author)
        }
        const channel = new ChannelRepository({
            name: faker.word.noun() + " Channel",
            type: faker.helpers.arrayElements(['text', 'vocal']),
            description: faker.lorem.sentence(),
            admin_id: author,
            message: [],
            members: members,
            created_at: faker.date.past(),
            member_auth: faker.helpers.arrayElements(['read_only', 'read_send'])
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
        let chatId = faker.helpers.maybe(() => faker.helpers.arrayElement(channels)._id)
        const activity = new ActivityRepository({
            title: faker.word.noun() + " Activity",
            description: faker.lorem.sentence(),
            created_at: faker.date.past(),
            date_reservation: faker.date.future(),
            publication_id: faker.helpers.arrayElement(publication)._id,
            author_id: author,
            channel_chat_id: chatId,
            participants_id: members
        });
        await activity.save();
        activities.push(activity)
    }
    return activities
}