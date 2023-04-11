import { useSpaceStore } from "./space";
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ACTIVITY_TYPE, type Activity } from "@/stores/types";
import { faker } from "@faker-js/faker/locale/ja";
import dayjs from "dayjs";

export const useActivityStore = defineStore("activity", () => {
  // State
  const spaceStore = useSpaceStore();
  const activity = ref<Array<Activity>>([]);
  const activityInfo = ref({} as Activity);
  const now = dayjs();

  // Getters

  // gets events by a pre-selected Space
  // const selectedSpaceActvities = computed(() => {
  //   console.log(
  //     "List of Acitivities by Space UUID",
  //     spaceStore.selectedTreeItem.uuid
  //   );
  //   return activity.value.filter(
  //     (item) => item.uuid === spaceStore.selectedTreeItem.uuid
  //   );
  // });

  // filters activities depending on passed Space UUID
  const getActivitiesBySpaceId = computed(() => (payload: Activity) => {
    console.log("List of Acitivities by Space UUID", payload.space_uuid);
    const filteredActivities = activity.value.filter(
      (item) => item.space_uuid === payload.space_uuid
    );
    console.log(filteredActivities);
    return filteredActivities;
  });

  //for population of fake data only
  const getActivities = (count = 40) => {
    console.log("Activities");

    for (let i = 0; i < count; i++) {
      const actInfo = {} as Activity;

      if (i < randomNumber.value) {
        actInfo.space_uuid = spaceStore.currentNode?.id;
      } else {
        actInfo.space_uuid = faker.datatype.uuid();
      }
      actInfo.type = ACTIVITY_TYPE.TAG_CLICK;
      actInfo.created_on = now.format("YYYY/MM/DD");

      console.log("Activity Details", actInfo);
      // activity.value.push(actInfo)
      addActivity(actInfo);
    }
  };

  //for random total number of activities in a selected space
  //fake app usaage only
  const randomNumber = computed(() => {
    return faker.datatype.number({ min: 15, max: 24 });
  });

  // Methods
  const addActivity = (payload: Activity) => {
    console.log("Acitvity Saved", payload);
    activity.value.unshift(payload);
  };

  return {
    // state
    activity,

    // getters
    // selectedSpaceActvities,
    getActivitiesBySpaceId,

    // methods
    addActivity,
    getActivities, //for population of fake data only
    randomNumber, //for fake app usage only
  };
});
