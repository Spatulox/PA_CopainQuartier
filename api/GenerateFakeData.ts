import { faker } from "@faker-js/faker";
import { UserTable } from "./src/DB_Schema/UserSchema";
import { TrocTable } from "./src/DB_Schema/TrocSchema";
import { PublicationTable } from "./src/DB_Schema/PublicationSchema";
import { ChannelTable } from "./src/DB_Schema/ChannelSchema";
import { ActivityTable } from "./src/DB_Schema/ActivitiesSchema";
import { InviteTable } from "./src/DB_Schema/InviteSchema";
import { JavaTable } from "./src/DB_Schema/JavaSchema";

import { closeDB, connectDB } from "./src/DB_Schema/connexion";
import { hashPassword } from "./src/Services/auth/password";
import { Channel } from "./src/Models/ChannelModel";
import { User } from "./src/Models/UserModel";
import { Activity } from "./src/Models/ActivityModel";
import { Publication } from "./src/Models/PublicationModel";
import { Troc } from "./src/Models/TrocModel";

export async function GenerateFakeData() {
  await connectDB();
  console.log("Generating fake data...");

  const users = await FakeUsers();
  console.log("Users generated...");

  const channels = await FakeChannels(users);
  console.log("Channels generated...");

  await UpdateUserChannelLinks(channels);
  console.log("Users linked to channels...");

  const trocs = await FakeTrocs(users, channels);
  console.log("Trocs generated...");

  await UpdateUserTrocs(trocs);
  console.log("Users linked to trocs...");

  const publications = await FakePublications(users);
  console.log("Publications generated...");

  const activities = await FakeActivities(users, channels, publications);
  console.log("Activities generated...");

  await UpdateActivityPublicationChannelLinks(activities, publications, channels);
  console.log("Activities linked with publications and channels...");

  const invites = await FakeInvites(channels, users);
  console.log("Invites generated...");

  const javas = await FakeJavaVersions();
  console.log("Java versions generated...");

  await closeDB();
  console.log("Data generation completed!");
}

GenerateFakeData();

async function FakeUsers() {
    const users = [];

    const profileImagePath = "img/profile/1.png";

    // Create 1 admin user
    const adminUser = new UserTable({
        name: faker.person.firstName(),
        lastname: faker.person.lastName(),
        email: "admin@admin.com",
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        verified: true,
        role: "admin",
        group_chat_list_ids: [],
        troc_score: faker.helpers.maybe(() => faker.number.int({ min: 0, max: 100 }).toString(), { probability: 0.7 }),
        password: await hashPassword("123456789"),
        friends_id: new Map(),
        friends_request_id: [],
        image_link: profileImagePath,
        resetNumber: null,
    });
    users.push(await adminUser.save());

    const memberUser = new UserTable({
        name: faker.person.firstName(),
        lastname: faker.person.lastName(),
        email: "member@member.com",
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        verified: true,
        role: "member",
        group_chat_list_ids: [],
        troc_score: faker.helpers.maybe(() => faker.number.int({ min: 0, max: 100 }).toString(), { probability: 0.7 }),
        password: await hashPassword("123456789"),
        friends_id: new Map(),
        friends_request_id: [],
        image_link: profileImagePath,
        resetNumber: null,
    });
    users.push(await memberUser.save());

  // Create 20 member users
    for (let i = 0; i < 20; i++) {
        const user = new UserTable({
            name: faker.person.firstName(),
            lastname: faker.person.lastName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            address: faker.location.streetAddress(),
            verified: faker.datatype.boolean(),
            role: "member",
            group_chat_list_ids: [],
            troc_score: faker.helpers.maybe(() => faker.number.int({ min: 0, max: 100 }).toString(), { probability: 0.7 }),
            password: await hashPassword(faker.internet.password()),
            friends_id: new Map(),
            friends_request_id: [],
            image_link: profileImagePath,
            resetNumber: null,
        });
        users.push(await user.save());
    }
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const friends = faker.helpers.arrayElements(
            users.filter(u => u._id.toString() !== user._id.toString()), 
            { min: 0, max: 3 }
        );
        for (const friend of friends) {
            user.friends_id[friend._id.toString()] = friend._id.toString();

            if (!friend.friends_id[user._id.toString()]) {
            friend.friends_id[user._id.toString()] = user._id.toString();
            await friend.save();
            }
        }
        await user.save();
    }

  return users;
}

async function FakeChannels(users: User[]) {
  const channels = [];

  for (let i = 0; i < 10; i++) {
    const admin = faker.helpers.arrayElement(users);
    // Select members including admin
    let members = faker.helpers.arrayElements(users, { min: 3, max: 10 });
    if (!members.find(m => m._id.equals(admin._id))) {
      members.push(admin);
    }

    const channel = new ChannelTable({
      name: faker.word.noun() + " Channel",
      type: faker.helpers.arrayElement(["text", "vocal"]),
      description: faker.lorem.sentence(),
      admin_id: admin._id,
      messages: [], // empty for now
      members: members.map(m => m._id),
      created_at: faker.date.past(),
      member_auth: faker.helpers.arrayElement(["read_send", "read_only"]),
      private: faker.datatype.boolean(),
    });

    channels.push(await channel.save());
  }

  return channels;
}

async function UpdateUserChannelLinks(channels: Channel[]) {
  for (const channel of channels) {
    for (const memberId of channel.members) {
      const user = await UserTable.findById(memberId);
      if (user) {
        if (!user.group_chat_list_ids.includes(channel._id)) {
          user.group_chat_list_ids.push(channel._id);
          await user.save();
        }
      }
    }
  }
}

async function FakeTrocs(users: User[], channels: Channel[]) {
  const trocs = [];

  for (let i = 0; i < 30; i++) {
    const author = faker.helpers.arrayElement(users);
    const reservedByUsers = faker.helpers.arrayElements(users, { min: 0, max: 3 });

    const trocImagePath = `img/activity/${faker.number.int({ min: 1, max: 2 })}.png`;

    const troc = new TrocTable({
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      author_id: author._id,
      status: faker.helpers.arrayElement(["pending", "completed", "cancelled"]),
      type: faker.helpers.arrayElement(["item", "service"]),
      created_at: faker.date.past(),
      reserved_at: reservedByUsers.length > 0 ? faker.date.recent() : null,
      reserved_by: reservedByUsers.map(u => u._id),
      updated_at: faker.date.recent(),
      visibility: faker.helpers.arrayElement(["visible", "hide"]),
      channel_id: faker.helpers.arrayElement(channels)._id,
      max_user: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 5 }), { probability: 0.7 }),
      image_link: trocImagePath,
    });

    trocs.push(await troc.save());
  }

  return trocs;
}

async function UpdateUserTrocs(trocs: Troc[]) {
  // Assuming you want to link trocs to users in fields trocs_created and trocs_reserved
  // But these fields are not defined in UserSchema you shared,
  // so either add them or skip this step.

  // If you want, you can add these fields dynamically or ignore this update.
  // For demonstration, skipping this step.
}

async function FakePublications(users: User[]) {
  const publications = [];
  const publicationImagePath = `img/activity/${faker.number.int({ min: 1, max: 2 })}.png`;
  for (let i = 0; i < 40; i++) {
    const author = faker.helpers.arrayElement(users);

    const publication = new PublicationTable({
      name: faker.lorem.sentence(3),
      description: faker.lorem.sentence(),
      body: faker.lorem.paragraphs(2),
      author_id: author._id,
      created_at: faker.date.past(),
      updated_at: faker.date.recent(),
      image_link: publicationImagePath,
      activity_id: null, // will be linked later
    });

    publications.push(await publication.save());
  }

  return publications;
}

async function FakeActivities(users: User[], channels: Channel[], publications: Publication[]) {
  const activities = [];
  const activityImagePath = `img/activity/${faker.number.int({ min: 1, max: 2 })}.png`;

  for (let i = 0; i < 50; i++) {
    const author = faker.helpers.arrayElement(users);
    let participants = faker.helpers.arrayElements(users, { min: 2, max: 10 });
    if (!participants.find(p => p._id.equals(author._id))) {
      participants.push(author);
    }

    const maxPlace = faker.number.int({ min: participants.length, max: 20 });
    const reservedPlace = faker.number.int({ min: 0, max: maxPlace });
    const publication = faker.helpers.arrayElement(publications);

    const activity = new ActivityTable({
      title: faker.word.noun() + " Activity",
      description: faker.lorem.sentence(),
      created_at: faker.date.past(),
      date_reservation: faker.date.future(),
      date_end: faker.date.future(),
      author_id: author._id,
      channel_chat_id: faker.helpers.arrayElement(channels)._id,
      publication_id: publication._id,
      participants_id: participants.map(p => p._id),
      location: faker.location.city(),
      max_place: maxPlace,
      reserved_place: reservedPlace,
      image_link: activityImagePath,
    });

    activities.push(await activity.save());
    await PublicationTable.findByIdAndUpdate(publication._id, { activity_id: activity._id });
  }

  return activities;
}

async function UpdateActivityPublicationChannelLinks(activities: Activity[], publications: Publication[], channels: Channel[]) {
  // Shuffle publications and channels to distribute them randomly
  let availablePublications = [...publications];
  let availableChannels = [...channels];

  for (const activity of activities) {
    // Link publication if available
    if (availablePublications.length > 0) {
      const randomIndex = Math.floor(Math.random() * availablePublications.length);
      const publication = availablePublications[randomIndex];

      await ActivityTable.findByIdAndUpdate(activity._id, {
        publication_id: publication._id,
      });

      await PublicationTable.findByIdAndUpdate(publication._id, {
        activity_id: activity._id,
      });

      availablePublications.splice(randomIndex, 1);
    }

    // Link channel (override if needed)
    if (availableChannels.length > 0) {
      const randomChannel = faker.helpers.arrayElement(availableChannels);

      await ActivityTable.findByIdAndUpdate(activity._id, {
        channel_chat_id: randomChannel._id,
      });
    } else {
      throw new Error("Not enough channels to link all activities.");
    }
  }
}

async function FakeInvites(channels: Channel[], users: User[]) {
  const invites = [];

  for (let i = 0; i < 20; i++) {
    const channel = faker.helpers.arrayElement(channels);
    // Randomly decide if invite has a channel or null
    const hasChannel = faker.datatype.boolean();

    const invite = new InviteTable({
      channel_id: hasChannel ? channel._id : null,
    });

    invites.push(await invite.save());
  }

  return invites;
}

async function FakeJavaVersions() {
  const javas = [];

  for (let i = 0; i < 5; i++) {
    const version = `Java-${faker.system.semver()}`;
    const filename = `javaapp.jar`;

    const java = new JavaTable({
      version,
      filename,
      createdAt: faker.date.past(),
    });

    javas.push(await java.save());
  }

  return javas;
}
