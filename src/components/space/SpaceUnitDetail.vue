<template>
  <div class="columns is-vcentered">
    <div class="column is-2">
      <p data-cy="space-unit-name">{{ $t(spaceStore.spaceUnitLabel + " name") }}</p>
    </div>
    <div class="column is-7">
      <o-field style="margin-bottom: 0">
        <o-input
          data-cy="space-unit-input"
          v-model="spaceStore.spaceUnitForm.name"
          maxlength="25"
          :variant="spaceStore.spaceUnitFormError.error_name ? 'danger' : ''"
        >
        </o-input>
      </o-field>
      <p
        data-cy="space-unit-input-error"
        class="is-size-7 has-text-danger"
        v-show="spaceStore.spaceUnitFormError.error_name"
      >
        {{ $t("is required", { label: $t(spaceStore.spaceUnitLabel + " name") }) }}
      </p>
    </div>
    <div class="column is-1">
      <p
        data-cy="ctr-name-label"
        :class="{ 'has-text-grey': !isNameMaxChars, 'has-text-danger': isNameMaxChars }"
      >
        <span data-cy="ctr-name">{{ countNameChars }}</span
        >/25
      </p>
    </div>
  </div>
  <div class="columns" v-if="spaceStore.spaceUnitForm.type_ === FOLDER_TYPE.SPACE">
    <div class="column is-2">
      <p>{{ $t("Showcase URL") }}</p>
    </div>
    <div class="column is-7">
      <o-field style="margin-bottom: 0">
        <o-input
          data-cy="space-unit-showcase-url"
          v-model="showcase_url"
          placeholder="https://my.matterport.com/show/?m=xxxxxxx"
          :variant="spaceStore.spaceUnitFormError.error_showcase_url ? 'danger' : ''"
        >
        </o-input>
      </o-field>
      <p
        data-cy="space-unit-showcase-url-error"
        class="is-size-7 has-text-danger"
        v-show="spaceStore.spaceUnitFormError.error_showcase_url"
      >
        {{ $t("Invalid URL") }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSpaceStore } from "@/stores/space";
import { FOLDER_TYPE } from "@/stores/types";
import type { Space } from "@/stores/types";
import { computed, ref, watch } from "vue";

const spaceStore = useSpaceStore();
const showcase_url = ref();

// get showcase url from spaceStore.spaceUnitForm
const spaceUnitShowcaseUrl = computed((): string => {
  if (spaceStore.spaceUnitForm.json_data) {
    const space = spaceStore.spaceUnitForm.json_data as Space;
    return space.space_url;
  }
  return "";
});

// update showcase_url
watch(spaceUnitShowcaseUrl, (payload: string) => {
  showcase_url.value = payload;
});

// bind spaceUnitForm.data to space; since data prop on space Unit is <Section | Facility | Space>
watch(showcase_url, (payload: string) => {
  const space = {} as Space;
  space.space_url = payload;
  spaceStore.spaceUnitForm.json_data = space;
});

const countNameChars = computed(() =>
  spaceStore.spaceUnitForm.name ? spaceStore.spaceUnitForm.name.length : 0
);
const isNameMaxChars = computed(() => countNameChars.value >= 25);

</script>
