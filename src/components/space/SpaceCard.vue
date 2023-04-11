<template>
  <div class="columns">
    <div class="column is-12" style="height: 500px">
      <h3 class="title is-size-6 menu-item-text has-text-left ml-3">Name</h3>
      <div class="container">
        <div class="media-data">
          <div class="tile is-ancestor is-flex-wrap-wrap">
            <div
              class="tile is-parent is-4 p-1 mx-0 card-size"
              v-for="child in spaceStore.nodeChildren"
              :key="child.id"
            >
              <article
                class="tile is-child box has-text-centered is-clipped"
                @click="emit('click-card', { action: 'cardClick', child })"
              >
                <div class="columns card-icon-background">
                  <div class="column is-half is-offset-one-quarter" data-cy="card-item">
                    <o-icon
                      pack="mdi"
                      icon="layers-triple"
                      size="large"
                      class="card-icon"
                      v-if="child.type_ === FOLDER_TYPE.SECTION"
                    >
                    </o-icon>
                    <o-icon
                      pack="mdi"
                      icon="office-building"
                      size="large"
                      class="card-icon"
                      v-else-if="child.type_ === FOLDER_TYPE.FACILITY"
                    >
                    </o-icon>
                  </div>
                  <div class="column is-full">
                    <figure
                      class="image 256x256"
                      v-if="child.type_ === FOLDER_TYPE.SPACE"
                    >
                      <!-- <img
                      width="256"
                      height="256"
                      class="card-image-container"
                      src="../../../public/reception.jpg" /> -->

                      <img
                        class="card-image-container is-pulled-left"
                        :src="child.data['space_image']"
                      />
                    </figure>
                  </div>
                  <div class="column is-full card-name-container">
                    <div class="content">
                      <span class="menu-text">
                        {{ child.name + " " + child.type_ }}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSpaceStore } from "@/stores/space";
import { FOLDER_TYPE } from "@/stores/types";

const spaceStore = useSpaceStore();

const emit = defineEmits(["click-card"]);
</script>
