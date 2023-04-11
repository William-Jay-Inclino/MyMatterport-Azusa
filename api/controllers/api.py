from os import access
import uuid
from treelib import Node, Tree
import json

response.view = 'generic.json' 

response.headers['Content-Type'] = 'application/json; charset=utf-8'
response.headers['Access-Control-Allow-Origin'] = 'locahost:8888'
response.headers['Access-Control-Max-Age'] = 86400
response.headers['Access-Control-Allow-Headers'] = 'Origin'
response.headers['Access-Control-Allow-Methods'] = ['GET','POST','PUT','OPTIONS','DELETE']
response.headers['Access-Control-Allow-Credentials'] = 'true'
response.headers['Access-Control-Allow-Headers'] = "Accept, Authorization, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, Accept-Encoding"
def index():
    redirect('v1')
    
def valid_api_key(app_key=None):
    # no need for API key if localhost
    return True
    if request.env.HTTP_HOST in ['localhost','rev-kitten.com'] : return True

    # do check if the api_key exist in the api_sec table if yes return true, else false
    if app_key==None:
        if request.env.HTTP_APPKEY:
            app_key = request.env.HTTP_APPKEY
        elif request.env.HTTP_AUTHORIZATION:
            app_key = request.env.HTTP_AUTHORIZATION
        else:
            return False
    
    domain=request.env.HTTP_HOST



    aps = db.api_security
    query = aps.api_key == app_key
    query &= aps.client_domain.contains(domain)
    result = db(query).count()

    
    logger.info("--> API REQUEST: {0}, {1}, {2}".format(app_key,domain,result))

    if result:
        return True
    else: 
        logger.warning('====> WARNING: INVALID API_KEY REQUESTED <=== {0}, {1}'.format(domain,app_key))
        return False

@request.restful()
def v1():
    response.view = 'generic.json' 

    # allow CORS
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = "POST,GET,OPTIONS,PUT,DELETE"
    response.headers['Access-Control-Allow-Credentials'] = "true"
    response.headers['Access-Control-Allow-Headers'] = "Accept, Authorization, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, Accept-Encoding"

    @auth.requires(valid_api_key(), requires_login=False)   
    # @auth.requires_login()
    def GET(*args, **vars):  
        # response.view = 'generic.json' 
        logger.info('args: {0} , vars: {1}'.format(args,vars))

        if len(args)==0: return dict(status='fail',message='No matching pattern or missing parameters')
        
        # validate public space URL
        if len(args)==2 and args[0]=='validateSpaceToken' and args[1]!='':
            '''
            GET /validateSpaceToken/<space_uuid>?token=<some_access_token>
            - return true if some_access_token is valid for the given
            space_uuid

            params: 
            - space_uuid
            - token
            '''

            if 'token' not in vars: return dict(status='fail',message='access token is missing or invalid')

            # get
            token = vars['token']
            uuid = args[1]

            s = db.spaces

            res = db((s.uuid==uuid) and (s.access_token==token)).select(s.access_token,s.is_public).first()
            logger.info('validateSpaceToken: {}'.format(res))

            if res == None: return dict(status='fail',message='invalid space uuid or token')

            if res['is_public'] == False: return dict(status='fail',message='space is not public')

            # we might need to add more validation here like expiry dates
            return dict(status='success',message='space access token is valid')

        # TREES
        if len(args)>=1 and args[0] == 'trees': 
            '''
            GET /api/v1/trees
            - returns all folder tree

            params:
            - NONE

            GET /api/v1/trees/<owner_uuid>
            - returns all folder tree, owned by uuid

            params:
            - owner_uuid

            GET /api/v1/trees/<column_name>/<column_value>
            - returns all folder tree, filtered by some column_name

            params:
            - owner_uuid
            
            '''
            fd = db.folders
            # folder_type = vars['folder_type']
       
     
            tree = Tree()
            if len(args) >=1:
                query = fd.uuid != ''
            
            if len(args) == 2:
                query &= ((fd.owner_uuid == args[1]) | (fd.owner_uuid == None))

            if len(args) == 3:
                f = args[1].replace("-","_")
                v = args[2]
                query &= (fd[f] == v) 

            folders = db(query).select(fd.uuid,fd.parent_uuid,fd.name,fd.type_,fd.owner_uuid,fd.json_data).as_dict(key='uuid')
            while len(folders):
                for k,v in list(folders.items()):
                    logger.info('k: {0}, v: {1}, root: {2}'.format(k,v,tree.root))

                    # attach folder objects
                    attach = ['roles','categories','spaces','users']
                    for t in attach:
                        if t == 'users': 
                            au = db['auth_user']
                            it = db['folder_users']

                            name = (db.auth_user.first_name + ' ' + db.auth_user.last_name).with_alias('name')
                            a_result = db(it.folder_uuid==v['uuid']).select(it.uuid,it.folder_uuid,it.name,it.color,it.json_data
                                ,au.id, au.uuid, au.first_name,au.last_name,au.email,au.mobile,name,
                                join=[au.on(au.id==it.user_id)]).as_list()
                        elif t=='spaces':
                            it = db[t]
                            a_result = db(it.folder_uuid==v['uuid']).select(it.uuid,it.folder_uuid,it.space_name,it.space_url,it.space_sid,it.json_data).as_list()
                        elif t=='categories':
                            it = db[t].with_alias('categories')
                            st = db[t].with_alias('sub')
                            cat_result = db(it.folder_uuid==v['uuid'] and it.parent_uuid == None).select(it.uuid,it.folder_uuid,it.name,it.color,it.parent_uuid,it.json_data).as_list()   

                            # append sub categories
                            a_result = []
                            for cat in cat_result:
                                sub_result = db(it.folder_uuid==v['uuid'] and it.parent_uuid == cat['uuid']).select(it.uuid,it.name,it.color,it.parent_uuid,it.json_data).as_list()   
                                cat['subcategories'] = sub_result
                                a_result.append(cat)
                        else:
                            it = db[t]
                            a_result = db(it.folder_uuid==v['uuid']).select(it.uuid,it.folder_uuid,it.name,it.color,it.json_data).as_list()
                         
                        v[t] = a_result

                    if not v['parent_uuid']: 
                        if not tree.root:
                            tree.create_node(tag=v['name'],identifier=k,parent= v['parent_uuid'],data=v)
                            folders.pop(k)
                        else:
                            tree.create_node(tag=v['name'],identifier=k,parent= tree.root,data=v)
                            folders.pop(k)
                    else:
                        if tree.contains(v['parent_uuid']) and not tree.contains(k):
                            tree.create_node(tag=v['name'],identifier=k,parent=v['parent_uuid'],data=v)
                            folders.pop(k)
 
            logger.info('TREE ROOT: {}'.format(tree.root))
            # attach contents to folders
       
            table_name = 'roles'
            # tag_name = dict(spaces='space_name',media='name')
            # if table_name in db.tables:
            #     it = db[table_name]
            #     attach = db(it).select(it.uuid,it.folder_uuid,it.name,it.color).as_dict(key='uuid')
            #     while len(attach):
            #         for k,v in list(attach.items()):
            #             logger.info('k: {0}, v: {1}, root: {2}'.format(k,v,tree.root))
            #             if not v['folder_uuid']: 
            #                 if not tree.root:
            #                     tree.create_node(tag=v['name'],identifier=k,parent=None,data=v)
            #                     attach.pop(k)
            #                 else:
            #                     tree.create_node(tag=v['name'],identifier=k,parent=tree.root,data=v)
            #                     attach.pop(k)

            #             elif tree.contains(v['folder_uuid']) and not tree.contains(k):
            #                 tree.create_node(tag=v['name'],identifier=k,parent=v['folder_uuid'],data=v)
            #                 attach.pop(k)
            #             else:
            #                 tree.create_node(tag=v['name'],identifier=k,parent=tree.root,data=v)
            #                 attach.pop(k)

            res = json.loads(tree.to_json(with_data=True))
            logger.info(tree.all_nodes())

            return dict(data = res)


        # USERS
        if len(args)>0 and args[0] in ['users']:
            table_name = 'auth_user'
            t = db[table_name]

            if len(args) >= 1:
                logger.info('WARNING!!! This returns ALL users...')
                query = t.id>0 
      
            if len(args) == 2:
                query &= t['uuid'] == args[1]

            if len(args) == 3:
                f = args[1].replace('-','_')
                v = args[2]
                
                query &= t[f] == v
        
            result=db(query).select(t.ALL)
            data = []
            for r in result:
                filter_fields = ['password','registration_key','reset_password_key','registration_id']
                for f in filter_fields: r.pop(f) 
                user_groups = auth.user_group(r['id'])  
                r['user_groups'] = user_groups        
                data.append(r)
                    
            return dict(data=data)
            # am = db.auth_membership
            # user_auth_membership = db(am.id > 0).select()
            # logger.info('user_auth_membership {}'.format(user_auth_membership))
            # data_objects = []
            # if user_auth_membership: #if auth_membership is NOT empty!
            #     for membership in user_auth_membership:
            #         if membership.user_id:
            #             data=db(t.id==membership.user_id).select(left=t.on(am.user_id == t.id),cache=(cache.ram, 5), cacheable=True).first().as_dict()
            #             data['auth_user'].pop('password')
            #             logger.info('user_auth_membership data {0}'.format(data))            
            #             data_objects.append(data)
            #     # logger.info('data_objects{0}'.format(data_objects))
            #     return dict(data=data_objects)
            # else: #if empty then loop into auth_user and create auth_membership for it.. 
            #     auth_user = db(t.id > 0).select()
            #     for user in auth_user:
            #         logger.info('auth_user {0}'.format(user))
            #         create_auth_membership = am.validate_and_insert(user_id=user.id, group_id=3) # 3 for normal user
            #         logger.info('create_auth_membership {0}'.format(create_auth_membership))
            #         data_objects.append(create_auth_membership)
            #     logger.info('data_objects{0}'.format(data_objects))
            #     return dict(data=data_objects)

        # TABLE_NAME
        if len(args)>0 and args[0] in [*db.tables]: 
            table_name = args[0]
            t = db[table_name]

            if len(args) >= 1:
                logger.info('WARNING!!! This returns ALL {}...'.format(table_name))
                query = t.uuid !=''

            if len(args) == 2:
                query &= t['uuid'] == args[1]


            if len(args) == 3:
                f = args[1].replace('-','_')
                v = args[2]
                query &= t[f] == v
        
            result=db(query).select(t.ALL)
            data = []
            for r in result:
                filter_fields = ['user_agent']
                for f in filter_fields: r.pop(f)            
                data.append(r)
        
            return dict(data=data)

        return locals()
   
    @auth.requires(valid_api_key(), requires_login=False)
    # @auth.requires_login()
    def POST(table_name, **vars):
        response.view = 'generic.json' 
        logger.info('table: {0} , vars: {1}'.format(table_name,vars))

        if table_name == 'add_role':
            logger.info('add role')
            if not ('role' in vars): 
                return dict(statatus="fail",message="role is required")
            
            # get 
            role = vars['role']
            desc = vars['desc'] if 'desc' in vars else ""
            
            group_id = auth.add_group(role,desc)
            if group_id>0:
                return dict(status="success",message=dict(group_id=group_id,role=role,desc=desc))
            else:
                return dict(status="fail",message=dict(error=group_id))


        if table_name == 'add_membership': 
            logger.info('add_membership (to group)')

            if not ('role' in vars): 
                return dict(status="fail",message="role is required")
            if not ('user_id' in vars):
                return dict(status="fail",message="user_id is required")

            role = vars['role']
            user_id = vars['user_id']
            group_id = auth.id_group(role)
            if group_id>0:
                id = auth.add_membership(group_id,user_id)
                if id>0:
                    return dict(status="success",message="user added to role")
                else:
                    return dict(status="fail",message="user not added to role")
            else:
                return dict(status="fail",message="invalid role")

        if table_name == 'add_permission': 
            logger.info('add_membership (to group)')

            if not ('role' in vars): 
                return dict(status="fail",message="role is required")
            if not ('user_id' in vars):
                return dict(status="fail",message="user_id is required")

            role = vars['role']
            user_id = vars['user_id']
            group_id = auth.id_group(role)
            if group_id>0:
                id = auth.add_membership(group_id,user_id)
                if id>0:
                    return dict(status="success",message="user added to role")
                else:
                    return dict(status="fail",message="user not added to role")
            else:
                return dict(status="fail",message="invalid role")

        # make sure uuid is not set to enable db default
        if 'uuid' in vars: vars.pop('uuid')

        if table_name not in [*db.tables,'users']:
            return dict(status='fail',message='No matching pattern or missing parameters')

        if table_name == 'users': table_name = 'auth_user'
        # extract table
        t = db[table_name]

        # logger.info('auth_user table: {0} '.format(db(db.auth_user.id > 0).select(t.ALL)))
        # try insert
        res = t.validate_and_insert(**vars)
        logger.info('result: {0} '.format(res))
        # if table_name == 'auth_user':
        #     logger.info('ADD USER RESULT: {0} '.format(res.id['uuid']))
        #     logger.info('ADD USER group ID: {0} '.format(vars['group_id']))
        #     am = db.auth_membership
        #     user_membership = am.validate_and_insert(user_id=res.id, group_id=vars['group_id'])
        #     logger.info('user_membership result: {0} '.format(user_membership))
        #     data = db(t.uuid == res.id['uuid']).select(left=t.on(am.user_id == t.id)).first().as_dict()
        #     logger.info('user_membership and auth_user data: {0} '.format(data))
        #     return dict(data=data)

        if res.errors:
            res.pop('id')
            return dict(status="fail",message=res)
        else:
            data = db(t.uuid == res.id['uuid']).select().first().as_dict()
            logger.info('user_membership and auth_user data: {0} '.format(data))
            return dict(status="success",data=data)


    @auth.requires(valid_api_key(), requires_login=False)   
    # @auth.requires_login()
    def PUT(*args, **vars):
        response.view = 'generic.json' 
        logger.info('args: {0} ,  vars: {1}'.format(args,vars))

        if len(args)==0: return dict(status='fail',message='No matching pattern or missing parameters')

        # force remove uuid to avoid overriding 
        # if 'uuid' in vars: vars.pop('uuid')

        # verify parameters
        if len(args)<2 or vars == {}:
            return 'no matching pattern'

        if args[0] in [*db.tables,'users']:
            table_name = args[0]
            uuid = args[1]
        else:
            return 'no matching pattern'


        if table_name == 'users': table_name = 'auth_user'

        # extract table and id
        t = db[table_name]    

        logger.info('PUT... {0}, {1}, {2}'.format(t,uuid,vars))

        # try update
        res = db(t.uuid==uuid).update(**vars)
        auth_user_id = db(t.uuid==uuid).select().first()
        user_membership = []
        logger.info('res... {0}, auth_user_id {1}'.format(res,auth_user_id))
        if table_name == 'auth_user':
            am = db.auth_membership 
            logger.info('GET USER ID: {0} '.format(auth_user_id.id))
            logger.info('GET USER group: {0} '.format(vars['group_id']))
            user_membership = db(am.user_id == auth_user_id.id).update(group_id=vars['group_id'])
            data = db(t.uuid == uuid).select(left=t.on(am.user_id == t.id)).first().as_dict()
            logger.info('data: {}'.format(data))
            return dict(data=data)

        # include updated data in response
        if res == 1 :
            data = db(t.uuid == uuid).select(t.ALL).first().as_dict()
            logger.info('data: {}'.format(data))
            return dict(data=data)
        else:
            return dict(res)

    @auth.requires(valid_api_key(), requires_login=False)  
    # @auth.requires_login()
    def DELETE(table_name, uuid, *args):
        response.view = 'generic.json' 
        logger.info('table: {0} , uuid: {1}, args: {2}'.format(table_name,uuid,args))
        
        # extract table and id
        if table_name in [*db.tables,'users']:
            if table_name == 'users': table_name = 'auth_user'
            t = db[table_name]
        else:
            return dict(status='fail',message='No matching pattern or missing parameters')

        # try delete
        res = db(t.uuid==uuid).delete()
        logger.info('res: {}'.format(res))
        

        return dict(deleted=res,errors={})

    # don't remove the line below
    return locals()

@request.restful()
def cas(): 
    '''
    CAS REST protocol

    api/cas/validate
    api/cas/tickets
    api/cas/users

    '''

    @auth.requires(valid_api_key(), requires_login=False)   
    def GET(*args, **vars):
        logger.info('GET CAS() args: {0}, vars: {1}'.format(args,vars))
        response.view ='generic.json'
        
        if len(args)<=0: return dict(status='fail',message='No matching pattern or missing parameters')


        # short alias
        u = db.auth_user
        m = db.auth_membership

        # ===> VALIDATE TICKET <====
        if len(args)==1 and 'validate' in args[0]:
            '''
            GET /api/cas/validate/<ticket>

            - to validate authentication ticket

            params:
            - ticket        Authentication ticket previously issued by this CAS
            
            '''

            logger.info('auth: {}'.format(session))

            if len(args)<2:
                return dict(status='fail',message='missing parameters')

            ticket = args[1]
            result = db(db.auth_cas.ticket==ticket).select(db.auth_cas.ALL).first()
            logger.info('result: {}'.format(result))

            if result !=None:
                # response.code=200
                logger.info(result.user_id)
                user = db(db.auth_user.id == result.user_id).select(db.auth_user.uuid).first()
                logger.info('USER: ',user)
                
                # result.update(dict(uuid=user['uuid'],space_root_uuid=user['space_root_uuit'],media_root_uuid=user['media_root_uuid']))
                return dict(status="success",data=session)
            else:
                return dict(status="fail",message="invalid ticket")

        # response.code = 400
        return dict(status="fail")

    @auth.requires(valid_api_key(), requires_login=False)   
    def POST(*args,**vars):
        logger.info('args: {0}, vars: {1}'.format(args,vars))
        response.view = 'generic.json'

        if len(args)<=0: return dict(status='fail',message='No matching pattern or missing parameters')

        # ===> REGISTER / CREATE USER <===
        if len(args)>0 and args[0] in ['users']:
            '''
            POST /api/cas/users
            - create or register User

            params:
            - first_name        Firstname of user
            - last_name         Lastname of user
            - email             Email address
            - password          Password
            '''

            logger.info('REGISTER USER ==> args: {0}, vars: {1}'.format(args,vars))

            if not vars: return dict(status="fail",message="missing parameters")

            # first_name and last_name is required, so set some value
            if not('first_name' in vars) and ('fullname' in vars):
                vars['first_name'] = vars['fullname'].split(' ')[0]
                vars['last_name'] = vars['fullname'].split(' ')[-1]

            # force remove id since this is create
            if 'id' in vars: vars.pop('id')

            result = db.auth_user.validate_and_insert(**vars)
            logger.info('result: {}'.format(result))

            if result['errors']:
                return dict(status="error",errors=result['errors'])
            else:   
                user = db.auth_user[result.id]              
                return dict(status="success",data=user)

        # ====> CREATE ACCESS TICKET (AUTHENTICATE) <=== 
        if 'tickets' in args[0]:
            '''

            POST api/cas/tickets
            - authenticates User

            params:
                - email         Email of user
                - password      Password of user

            return:
                - ticket        Access ticket
                - data          Includes user and session detail
            
            '''

            # validate parameters
            if vars == {}: return dict(status='fail',message="missing parameters")
            if not( 'email' in vars and 'password' in vars): return dict(status='fail',message="missing parameters")

            # force clear ticket
            auth.user = None

            # check if user is still in session
            if (auth.user == None) or (auth.user and auth.user.email != vars['email']):
                # attempt to login
                user = auth.login_bare(vars['email'].strip(),vars['password'].strip())
                logger.info('user: {}'.format(user))
                logger.info('auth.user: {}'.format(auth.user))
                if not user:
                    return dict(status='fail', message="invalid user credentials")
                
                logger.info('session: {}'.format(session))

            if auth.user:
                ticket = 'ST-1-{0}'.format(session.auth.hmac_key)
                db.auth_cas.update_or_insert(ticket==ticket,user_id=session.auth.user.id,ticket=ticket)

                data = session
                data.update(ticket=ticket)

                return dict(status='success',data=data)

        # response.code = 404
        return dict(status="error")

    @auth.requires(valid_api_key(), requires_login=False)   
    def PUT(*args,**vars):
        logger.info('args: {0}, vars: {1}'.format(request.args,request.vars))
        response.view = 'generic.json'

        if len(args)<=0: return dict(status='fail',message='No matching pattern or missing parameters')


        # update user
        if len(args)>0 and args[0] in ['users']:
            # get record uuid
            user_uuid = int(args[1] or 0)
            if not user_uuid:
                logger.info('{}'.format(uuid))
                return dict(status="fail",message='uuid is required')

            # first_name and last_name is required, so update it too
            if not('first_name' in vars) and ('fullname' in vars):
                logger.info('{}'.format(record_id))
                vars['first_name'] = vars['fullname'].split(' ')[0]
                vars['last_name'] = vars['fullname'].split(' ')[-1]
 
            if user_uuid:
                try:
                    result = db(db.auth_user.uuid==user_uuid).validate_and_update(**vars)
                    return dict(status="success",data=result)
                except:
                    return dict(status="error",error=T('Server or database error.'))
        
        # update membership role
        if len(args)>0 and args[0] in ['memberships']:

            # get record id 
            record_id = int(args[1] or 0)
            if record_id == 0:
                logger.info('{}'.format(record_id))
                return dict(status="fail",message='record id is required')
 
            if record_id>0:
                try:
                    result = db(db.auth_membership.user_id==record_id).validate_and_update(**vars)
                    return dict(status="success",data=result)
                except:
                    return dict(status="error",error=T('Server or database error.'))

        return dict(status="error")

    @auth.requires(valid_api_key(), requires_login=False)   
    def DELETE(*args):
        logger.info('args: {0}, vars: {1}'.format(request.args,request.vars))
        response.view ='generic.json'
        
        if len(args)<=0: return dict(status='fail',message='No matching pattern or missing parameters')
        
        if 'tickets' in args[0]:
            ticket = args[1]
            result = db(db.auth_cas.ticket==ticket).delete()
            if result != None: session = None

            logger.info('session: {}'.format(session))

            return dict(status="success")
        
        if 'users' in args[0]:
            user_id = int(args[1])
            result = db(db.auth_user.id==user_id).delete()
            logger.info('result: {}'.format(result))
            if result != None: session = None

            logger.info('session: {}'.format(session))

            # response.code=200
            return dict(status="success")
    
        if 'membership' in args[0]:
            user_id = int(args[1])
            result = db(db.auth_membership.user_id==user_id).delete()
            logger.info('result: {}'.format(result))
            if result != None: session = None

            logger.info('session: {}'.format(session))

            # response.code=200
            return dict(status="success")

        # response.code = 404
        return dict(status="error")

    return locals() #do not remove this

