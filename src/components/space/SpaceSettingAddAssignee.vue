<template>
    <section>
        <o-modal v-model:active="spaceStore.isSpaceAddAssigneeActive" :width="900" clip="scroll" data-cy="add-edit-assignee-modal">
            <div class="is-modal-scrollable">
                <h6 class="title is-6"> {{ $t('Add Assignee') }} </h6>
                <div class="columns is-vcentered">
                    <div class="column is-2">
                        <p> {{ $t('Mail Address') }} </p>
                    </div>
                    <div class="column is-7">
                        <o-field>
                            <o-input v-model="tempEmail" data-cy="assignee-name-input"></o-input>
                        </o-field>
                    </div>
                    <div class="column">
                        <button @click="saveTempEmail" class="button is-link is-rounded is-small"> {{ $t('Add to temporary list') }} </button>
                    </div>
                </div>
                
                <o-field>
                    <div class="columns is-vcentered">
                        <div class="column">
                            {{ $t('Bulk Registration with File') }}
                        </div>
                        <div class="column">
                            <CommonCsvImport class="file-upload" @update:csv="(csv) => resultCsv = csv"/>
                        </div>
                        <div class="column">
                            <p class="has-text-grey is-size-7 has-text-centered">
                                {{ $t('Readable csv/xlsx file that described Mail Address at First Line') }}
                            </p>
                        </div>
                    </div>
                </o-field>
                <o-table :data="users" :paginated="true" v-model:checked-rows="checkedRows" :pagination-simple="true" :per-page="4"
                    checkable checkbox-position="right" data-cy="add-assignee-table-wrapper">
                    <o-table-column :label="$t('Name')" v-slot:default="props">
                        <span data-cy="add-assignee-table-name-column" :data-cy-id="`add-assignee-table-name-${props.row.first_name}`">{{ props.row.first_name }}</span>
                    </o-table-column>
                    <o-table-column :label="$t('Email')" v-slot:default="props">
                        <span data-cy="add-assignee-table-email-column" :data-cy-id="`add-assignee-table-email-${props.row.email}`">{{ props.row.email }}</span>
                    </o-table-column>
                    <o-table-column field="roles" :label="$t('Owned Roles')" v-slot:default="props">
                        <div class="pill-direction-row" data-cy="add-assignee-table-roles-column">
                            <div v-for="role in props.row.roles" :style="{'background-color': convertToCssRgb(role.color.rgb)}" class="pill">
                                <span :class="isBgLight(convertToCssRgb(role.color.rgb)) ? 'has-text-black' : 'has-text-white'" :data-cy-id="`add-assignee-table-roles-${role.name}`">{{ role.name }}</span></div>
                        </div>
                    </o-table-column>
                    <template #bottom-left>
                        <!-- <b>Total checked</b>: {{ checkedRows.length }} -->
                    </template>
                </o-table><br>
                <div class="columns">
                    <div class="column">
                        <o-dropdown scrollable="true" :disabled="!checkedRows.length" position="top-left" max-height="140" aria-role="list"
                        data-cy="add-assignee-role-dropdown">
                            <template #trigger="{ active }">
                                <o-button variant="info" outlined rounded>
                                    <span>{{ $t('Add role to selected user') }}</span>
                                    <o-icon icon="account-multiple-plus-outline"></o-icon>
                                </o-button>
                            </template>
                    
                            <o-dropdown-item v-for="(role, index) in filteredRoles" :key="index" :value="role.uuid"
                                @click="(() => addRole(role))" aria-role="listitem" data-cy="add-role-dropdown-item">
                                <div class="media">
                                    <div class="media-content">
                                        <div class=" is-tiny"></div>
                                        <span>{{ role.name }}</span>
                                    </div>
                                </div>
                            </o-dropdown-item>
                        </o-dropdown>
                    </div><br>
                    <div class="column">
                        <o-dropdown scrollable="true" :disabled="!checkedRows.length" position="top-left" max-height="140" aria-role="list"
                        data-cy="remove-assignee-role-dropdown">
                            <template #trigger="{ active }">
                                <o-button variant="info" outlined rounded>
                                    <span>{{ $t('Remove role from selected user') }}</span>
                                    <o-icon icon="account-multiple-minus-outline"></o-icon>
                                </o-button>
                            </template>
                    
                            <o-dropdown-item v-for="(role, index) in selectedCurrentRole" :key="index" :value="role.uuid"
                                @click="() => removeRole(role)" aria-role="listitem" data-cy="remove-role-dropdown-item">
                                <div class="media">
                                    <div class="media-content">
                                        <span>{{ role.name }}</span>
                                    </div>
                                </div>
                            </o-dropdown-item>
                        </o-dropdown>
                    </div>
                    <div class="column">
                        <o-button variant="info" rounded outlined :disabled="!checkedRows.length" @click="removeUser" data-cy="remove-assignee-imported-dropdown">
                            <span>{{ $t('Remove selected user') }}</span>
                            <o-icon icon="account-minus-outline"></o-icon>
                        </o-button>
                    </div>
                </div>
                <div class="columns">
                    <div class="column">
                        <button @click="spaceStore.isSpaceAddAssigneeActive = false" class="button is-rounded">{{ $t('Cancel') }}</button>
                    </div>
                    <div class="column is-8">
                        <p class="has-text-grey is-size-7 has-text-centered">A user with only Mail Address written has not yet been officially registered in this Architwin environment.
After pressing the Add button on the right, an invitation email will be sent to the corresponding Mail Address.</p>
                    </div>
                    <div class="column">
                        <button class="button is-link is-rounded" @click="saveUsers" data-cy="add-assignee-btn">{{ $t('Save') }}</button>
                    </div>
                </div>
            </div>
        </o-modal>
    </section>
</template>

<script setup lang="ts">
import CommonCsvImport from '../common/CommonCsvImport.vue'
import { useSpaceStore } from '@/stores/space'
import { useRoleStore } from '@/stores/roles'
import type { User, Role, SpaceUnitUser} from '@/stores/types'
import { ref, watch } from 'vue'
import { convertToCssRgb, isBgLight } from '@/utils/color'
import { faker } from '@faker-js/faker'

const emit = defineEmits(["on-import"]);

const spaceStore = useSpaceStore();
const roleStore = useRoleStore();

//Parse data from csv and transfer it to data for rendering to table
const resultCsv = ref([])
const data = ref<Array<SpaceUnitUser>>([])
const users = ref<Array<User>>([])
const tempEmail = ref('')

const roles = ref<Array<Role>>([]);
const checkedRows = ref<Array<User>>([]);
const selectedCurrentRole = ref<Array<Role>>([]); //Roles of selected user(s)
const currentUserRoles = ref<Array<string>>([]); //Roles of All
const filteredRoles = ref<Array<Role>>([]);

//Variable used in watcher dependecy array to trigger code to refetch selected row and current user roles
const hasAssignedRolesChange = ref(false);

roles.value = spaceStore.currentNode?.roles ? spaceStore.currentNode.roles : []

watch(resultCsv, () => {
    data.value = resultCsv.value.slice(0,-1)
    users.value = resultCsv.value.slice(0,-1)
})

watch([checkedRows, hasAssignedRolesChange], () => {
  currentUserRoles.value = [];
  checkedRows.value.map((row) => {
    if (Object.keys(row.roles).length != 0) {
      return row.roles.map((r) => {
        currentUserRoles.value.push(r.uuid);
      });
    }
  });

  selectedCurrentRole.value = roles.value.filter((role:Role) =>
    currentUserRoles.value.includes(role.uuid)
  );
  if (currentUserRoles.value.length === 0) {
    filteredRoles.value = roles.value;
  } else {
    filteredRoles.value = roles.value.filter(
      (role:Role) => !currentUserRoles.value.includes(role.uuid)
    );
  }
});

const addRole = (val: Role) => {
  checkedRows.value.forEach((row) => {
    row.roles = [...row.roles, val];
  });
  hasAssignedRolesChange.value = !hasAssignedRolesChange.value;
};

const removeRole = (val: Role) => {
  checkedRows.value.forEach((row) => {
    const arr = row.roles.filter((role) => {
      return role.uuid != val.uuid;
    });
    row.roles = [];
    row.roles = arr;
  });
  hasAssignedRolesChange.value = !hasAssignedRolesChange.value;
};

const removeUser = () => {
    const newArr = users.value.filter(item => {
        return !checkedRows.value.find(row => {
            return item.uuid === row.uuid
        })
    })
    users.value = []
    checkedRows.value = []
    users.value = newArr
}

const saveUsers = () => {
    emit('on-import', users.value)
    users.value = []
    spaceStore.isSpaceAddAssigneeActive = false
}

const saveTempEmail = () => {
const email = tempEmail.value.split('@')
const name = email[0].split(".")

const user = {} as User
user.uuid = faker.datatype.uuid()
user.first_name = name[0]
user.last_name = name[1]
user.email = tempEmail.value
user.city = faker.address.city()
user.password = "password123"
user.roles = []

users.value.push(user)
}
</script>

<style>
.file-upload {
  border: dashed 2px rgba(128, 128, 128, 0.6);
  border-radius: 8px;
  padding: 4px;
  display: flex;
  flex-direction: row;
  max-width: 180px;
  justify-content: space-around;
}
</style>
